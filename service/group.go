package service

import (
	"log"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
)

type GroupService struct {
	groupRepository *repository.GroupRepository
}

func NewGroupService(repo *repository.GroupRepository) *GroupService {
	return &GroupService{
		groupRepository: repo,
	}
}

func (svc *GroupService) CreateGroup(group *model.Group) error {
	err := svc.groupRepository.CreateGroup(group)
	if err != nil {
		log.Println("service: create group错误: ", err)
		return err
	}
	return nil
}

func (svc *GroupService) FindGroup(condition *filter.FindGroup) (error, *model.Group) {
	err, group := svc.groupRepository.FindGroup(condition)
	if err != nil {
		log.Println("service: find group错误: ", err)
		return err, nil
	}
	return nil, group
}

func (svc *GroupService) ListGroup(condition *filter.ListGroup) (error, []*model.Group, int64) {
	err, groups, total := svc.groupRepository.ListGroup(condition)
	if err != nil {
		log.Println("service: list group错误: ", err)
		return err, nil, 0
	}
	return nil, groups, total
}

func (svc *GroupService) UpdateGroup(group *model.Group) error {
	err := svc.groupRepository.UpdateGroup(group)
	if err != nil {
		log.Println("service: update group错误: ", err)
		return err
	}
	return nil
}

func (svc *GroupService) DeleteGroup(group *model.Group) error {
	err := svc.groupRepository.DeleteGroup(group)
	if err != nil {
		log.Println("service: delete group错误: ", err)
		return err
	}
	return nil
}
