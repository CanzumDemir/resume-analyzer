from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import (
    create_user,
    create_user_auth,
    get_session,
    get_user_auth,
    get_user_by_username,
    user_exists,
)
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.users import User
from app.models.users_auth import UserAuth
from app.schemas.user import UserSignup

router = APIRouter()


@router.post("/signup", tags=["Signup"])
def signup(
    response: Response, user_data: UserSignup, session=Depends(get_session)
) -> dict:
    """Endpoint for user registration."""
    if user_exists(session, user_data.email, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User already exists"
        )

    try:
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
        )

        new_user = create_user(session, new_user)

        create_user_auth(
            session,
            user_auth=UserAuth(
                user_id=new_user.id,
                provider="local",
                password_hash=hash_password(user_data.password),
            ),
        )

        session.commit()
        session.refresh(new_user)

        access_token = create_access_token(data={"sub": str(new_user.id)})

        response.set_cookie(key="access_token", value=access_token, httponly=True)

        return {"user": new_user, "message": "Signed up user " + new_user.username}
    except Exception as e:
        session.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/login", tags=["Login"])
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    session=Depends(get_session),
):
    """Endpoint for user login."""
    user = get_user_by_username(session, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    user_auth = get_user_auth(session, user.id)
    if not user_auth or user_auth.provider != "local":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not verify_password(form_data.password, user_auth.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": str(user.id)})

    response.set_cookie(key="access_token", value=access_token, httponly=True)

    return {"message": "Login successful"}


@router.post("/logout", tags=["Logout"])
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(key="access_token")

    return {"message": "Logout successful"}
