package repo

import "music_system/model"

type IBaseModel interface {
	Create(baseModel *model.BaseModel) error
}
