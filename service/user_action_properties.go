package service

import (
	"log"

	"music_system/model"
	"music_system/repository"
)

type UserActionPropertiesService struct {
	UserActionPropertiesRepository *repository.UserActionPropertiesRepository
}

func NewUserActionPropertiesService(UAPRepo *repository.UserActionPropertiesRepository) *UserActionPropertiesService {
	return &UserActionPropertiesService{
		UserActionPropertiesRepository: UAPRepo,
	}
}

func (svc *UserActionPropertiesService) CreateUserActionProperties(UAP *model.UserActionProperties) error {
	err := svc.UserActionPropertiesRepository.CreateUserActionProperties(UAP)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}
