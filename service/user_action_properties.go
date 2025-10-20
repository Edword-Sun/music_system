package service

import (
	"log"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
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

func (svc *UserActionPropertiesService) FindUserActionProperties(UAPFilter filter.FindUserActionProperties) (error, []*model.UserActionProperties) {
	err, data := svc.UserActionPropertiesRepository.FindUserActionProperties(UAPFilter)
	if err != nil {
		log.Println("err: ", err.Error())
		return err, nil
	}

	return nil, data
}

func (svc *UserActionPropertiesService) UpdateUserActionProperties(UAP *model.UserActionProperties) error {
	err := svc.UserActionPropertiesRepository.UpdateUserActionProperties(UAP)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}

func (svc *UserActionPropertiesService) DeleteUserActionProperties(UAPFilter filter.DeleteUserActionProperties) error {
	err := svc.UserActionPropertiesRepository.DeleteUserActionProperties(UAPFilter)
	if err != nil {
		log.Println("err: ", err)
		return err
	}

	return nil
}
