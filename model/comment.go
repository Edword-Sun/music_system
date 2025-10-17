package model

import (
	"time"

	"gorm.io/gorm"
)

// Comment 评论
type Comment struct {
	UserID    string `gorm:"type:text;index" json:"user_id"`
	MusicID   string `gorm:"type:text;index" json:"music_id"`
	CommentID string `gorm:"type:text;index" json:"comment_id"` // 如果是评论的评论，就可以用这个ID

	// 评论内容
	Content string `gorm:"type:text" json:"content"` // 评论内容

	CreateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"create_time"`
	UpdateTime time.Time `gorm:"type:DATETIME with time zone;not null" json:"update_time"`
}

func (m *Comment) TableName() string {
	return "comment"
}

func (m *Comment) BeforeCreate(tx *gorm.DB) (err error) {
	m.CreateTime = time.Now()
	m.UpdateTime = time.Now()
	return nil
}

func (m *Comment) BeforeUpdate(tx *gorm.DB) (err error) {
	m.UpdateTime = time.Now()
	return nil
}
