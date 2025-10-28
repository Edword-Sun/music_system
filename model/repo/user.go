package repo

import "music_system/model"

type IUserRepository interface {
	Create(user *model.User) error

	Find(user *model.User) (error, *model.User)
	List(offset, size int) ([]*model.User, int64, error)

	Update(user *model.User) error
	Delete(user *model.User) error
}
