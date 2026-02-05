package service

import (
	"music_system/model"
	"music_system/model/repo"
)

type UserService struct {
	userRepo repo.IUserRepository
}

func NewUserService(userRepo repo.IUserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

func (s *UserService) CreateUser(user *model.User) error {
	return s.userRepo.Create(user)
}

func (s *UserService) GetUserByID(id string) (*model.User, error) {
	err, user := s.userRepo.Find(&model.User{ID: id})
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) GetUserByUsername(username string) (*model.User, error) {
	err, user := s.userRepo.Find(&model.User{Username: username})
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) UpdateUser(user *model.User) error {
	return s.userRepo.Update(user)
}

func (s *UserService) DeleteUser(id string) error {
	return s.userRepo.Delete(&model.User{ID: id})
}
