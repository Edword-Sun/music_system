package repo

import (
	"music_system/model"
	"music_system/tool/filter"
)

type IUserActionPropertiesRepository interface {
	CreateUserActionProperties(UAP *model.UserActionProperties) error
	FindUserActionProperties(findUAP filter.FindUserActionProperties) (error, []*model.UserActionProperties)
	UpdateUserActionProperties(UAP *model.UserActionProperties) error
	DeleteUserActionProperties(deleteUAP filter.DeleteUserActionProperties) error
}
