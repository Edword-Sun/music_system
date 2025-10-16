package repo

import "music_system/model"

type IMusicRepository interface {
	Create(md *model.Music) error
	Find(music *model.Music) (error, *model.Music)
	Update(music *model.Music) error
	Delete(music *model.Music) error
}
