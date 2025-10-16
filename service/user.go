package service

import (
	"fmt"
	"time"

	uuid "github.com/satori/go.uuid"

	"music_system/model"
	"music_system/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (svc *UserService) CreateUser(user *model.User) (error, string) {
	user.ID = uuid.NewV4().String()
	user.CreateTime = time.Now()
	user.UpdateTime = time.Now()

	err := svc.userRepo.Create(user)
	if err != nil {
		fmt.Println("svc create user 错误")
		return err, ""
	}

	return nil, user.ID
}

func (svc *UserService) FindUser(user *model.User) (error, *model.User) {
	err, getUser := svc.userRepo.Find(user)
	if err != nil {
		fmt.Println("svc find user 错误")
		return err, nil
	}
	return nil, getUser
}

func (svc *UserService) UpdateUser(user *model.User) error {
	//user.UpdatedTime = time.Now()
	err := svc.userRepo.Update(user)
	if err != nil {
		fmt.Println("svc update user 错误")
		return err
	}
	return nil
}

func (svc *UserService) DeleteUser(user *model.User) error {
	err := svc.userRepo.Delete(user)
	if err != nil {
		fmt.Println("svc delete user 错误")
		return err
	}
	return nil
}
