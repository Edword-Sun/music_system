package service

import "music_system/repository"

type UserActionPropertiesService struct {
	uapRepo *repository.UserActionPropertiesRepository
}

func NewUserActionPropertiesService(uapRepo *repository.UserActionPropertiesRepository) *UserActionPropertiesService {
	return &UserActionPropertiesService{
		uapRepo: uapRepo,
	}
}
