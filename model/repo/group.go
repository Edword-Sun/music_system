package repo

import (
	"music_system/model"
	"music_system/tool/filter"
)

type IGroupRepository interface {
	CreateGroup(group *model.Group) error
	FindGroup(condition *filter.FindGroup) (error, *model.Group)
	ListGroup(condition *filter.ListGroup) (error, []*model.Group, int64)

	UpdateGroup(group *model.Group) error
	DeleteGroup(group *model.Group) error
}
