package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"music_system/model"
)

type AuthService struct {
	userService *UserService
	secretKey   []byte
}

func NewAuthService(userService *UserService, secret string) *AuthService {
	return &AuthService{
		userService: userService,
		secretKey:   []byte(secret),
	}
}

func (s *AuthService) Register(username, password, nickname string) error {
	existing, _ := s.userService.GetUserByUsername(username)
	if existing != nil {
		return errors.New("用户已存在")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := &model.User{
		Username: username,
		Password: string(hashedPassword),
		Nickname: nickname,
		Role:     "user",
	}

	return s.userService.CreateUser(user)
}

func (s *AuthService) Login(username, password string) (string, *model.User, error) {
	user, err := s.userService.GetUserByUsername(username)
	if err != nil || user == nil {
		return "", nil, errors.New("用户不存在")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", nil, errors.New("密码错误")
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) GuestLogin() (string, *model.User, error) {
	user := &model.User{
		ID:       "guest",
		Username: "guest",
		Nickname: "游客",
		Role:     "guest",
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) GenerateToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"id":       user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

func (s *AuthService) ParseToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return s.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
