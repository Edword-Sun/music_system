package model

import (
	"time"
)

type BaseModel struct {
	ID          string    `gorm:"primarykey type:text;default:gen_random_uuid()" json:"id"`
	CreatedTime time.Time `gorm:"type:timestamp with time zone;not null" json:"create_time"`
	UpdatedTime time.Time `gorm:"type:timestamp with time zone;not null" json:"update_time"`
}

func (d *BaseModel) TableName() string {
	return "base_model"
}
