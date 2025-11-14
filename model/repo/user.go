package repo

import (
	"music_system/model"
	"music_system/tool/filter"
)

type IUserRepository interface {
	Create(user *model.User) error

	Find(condition *filter.FindUser) (error, *model.User)
	List(condition filter.ListUser) ([]*model.User, int64, error)

	Update(user *model.User) error
	Delete(user *model.User) error
}
