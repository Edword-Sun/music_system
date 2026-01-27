package service

import (
	"encoding/json"
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

func (svc *GroupService) AddMusicToGroup(groupID string, musicID string) error {
	// 1. 获取合集
	err, group := svc.groupRepository.FindGroup(&filter.FindGroup{ID: groupID})
	if err != nil {
		return err
	}

	// 2. 解析内容
	var musicIDs []string
	if group.Content != "" {
		importJSON := []byte(group.Content)
		if err := json.Unmarshal(importJSON, &musicIDs); err != nil {
			log.Println("service: 解析合集内容失败: ", err)
			musicIDs = []string{}
		}
	}

	// 3. 检查是否已存在
	for _, id := range musicIDs {
		if id == musicID {
			return nil // 已存在，直接返回
		}
	}

	// 4. 添加并序列化
	musicIDs = append(musicIDs, musicID)
	newContent, err := json.Marshal(musicIDs)
	if err != nil {
		return err
	}
	group.Content = string(newContent)

	// 5. 更新
	return svc.groupRepository.UpdateGroup(group)
}

func (svc *GroupService) RemoveMusicFromGroup(groupID string, musicID string) error {
	// 1. 获取合集
	err, group := svc.groupRepository.FindGroup(&filter.FindGroup{ID: groupID})
	if err != nil {
		return err
	}

	// 2. 解析内容
	var musicIDs []string
	if group.Content != "" {
		if err := json.Unmarshal([]byte(group.Content), &musicIDs); err != nil {
			return err
		}
	}

	// 3. 移除
	var newList []string
	for _, id := range musicIDs {
		if id != musicID {
			newList = append(newList, id)
		}
	}

	// 4. 序列化并更新
	newContent, err := json.Marshal(newList)
	if err != nil {
		return err
	}
	group.Content = string(newContent)

	return svc.groupRepository.UpdateGroup(group)
}
