package service

import (
	"fmt"
	"log"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
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
	err := svc.userRepo.Create(user)
	if err != nil {
		fmt.Println("svc create user 错误")
		return err, ""
	}

	return nil, user.ID
}

func (svc *UserService) FindUser(condition *filter.FindUser) (error, *model.User) {
	err, getUser := svc.userRepo.Find(condition)
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

func (svc *UserService) ListUsers(condition filter.ListUser) ([]*model.User, int64, error) {
	users, total, err := svc.userRepo.List(condition)
	if err != nil {
		log.Println("列表查找错误")
		return nil, 0, err
	}

	return users, total, nil
}
