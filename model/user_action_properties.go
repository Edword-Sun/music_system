package model

import (
	"time"

	"gorm.io/gorm"
)

// UserActionProperties 用户可以进行的操作，如点赞、收藏等
type UserActionProperties struct {
	ID      string `gorm:"primarykey type:text;default:(UUID())" json:"id"`
	UserID  string `gorm:"type:text" json:"user_id"`
	MusicID string `gorm:"type:text" json:"music_id"`

	Thumb     bool `gorm:"type:boolean" json:"thumb"`     // 点赞
	UnThumb   bool `gorm:"type:boolean" json:"un_thumb"`  // 倒赞
	Collected bool `gorm:"type:boolean" json:"collected"` // 收藏
	Share     bool `gorm:"type:boolean" json:"share"`     // 分享

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *UserActionProperties) TableName() string {
	return "user_action_properties"
}

func (m *UserActionProperties) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *UserActionProperties) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
