package check

import (
	"errors"
	uuid "github.com/satori/go.uuid"
	"log"
	"time"

	"music_system/model"
	"music_system/router/handler"
	"music_system/tool/filter"
)

func CheckCreateCommentReq(req *handler.CreateCommentReq) (error, model.Comment) {
	var res model.Comment

	var userID string
	var musicID string
	var commentID string
	var content string

	userID = req.UserID
	musicID = req.MusicID
	commentID = req.CommentID
	content = req.Content

	res = model.Comment{
		ID:         uuid.NewV4().String(),
		UserID:     userID,
		MusicID:    musicID,
		CommentID:  commentID,
		Content:    content,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}

	return nil, res
}

func CheckFindComment(req *handler.FindCommentReq) (error, filter.FindComment) {
	var res filter.FindComment

	// 参数
	var id string
	var musicID string
	var userID string
	var startTime int64
	var endTime int64

	// 赋值
	id = req.ID
	musicID = req.MusicID
	userID = req.UserID
	startTime = req.StartTime
	endTime = req.EndTime

	if startTime > endTime {
		log.Println("startTime > endTime 错误")
		return errors.New("startTime > endTime 错误"), res
	}
	if startTime == 0 && endTime == 0 {
		endTime = time.Now().UnixMilli()
	}

	// res
	res = filter.FindComment{
		ID:        id,
		MusicID:   musicID,
		UserID:    userID,
		StartTime: startTime,
		EndTime:   endTime,
	}

	return nil, res
}

func CheckListCommentReq(req *handler.ListCommentReq) (error, filter.FindCommentWithPagination) {
	var res filter.FindCommentWithPagination

	// 参数
	var ids []string
	var musicIDs []string
	var userIDs []string
	var startTime int64
	var endTime int64
	var page int
	var size int

	// 赋值
	ids = req.ID
	musicIDs = req.MusicID
	userIDs = req.UserID
	startTime = req.StartTime
	endTime = req.EndTime
	page = req.Page
	size = req.Size

	if startTime > endTime {
		log.Println("CheckListCommentReq: 起始时间大于结束时间 错误")
		return errors.New("起始时间大于结束时间"), res
	}
	if startTime == 0 && endTime == 0 {
		endTime = time.Now().UnixMilli()
	}

	if page == 0 {
		log.Println("CheckListCommentReq: page = 0 错误")
		return errors.New("page = 0"), res
	}
	if size == 0 {
		log.Println("CheckListCommentReq: size = 0 错误")
		return errors.New("size = 0"), res
	}

	// res
	res = filter.FindCommentWithPagination{
		ID:        ids,
		MusicID:   musicIDs,
		UserID:    userIDs,
		StartTime: startTime,
		EndTime:   endTime,
		Limit:     size,
		Offset:    (page - 1) * size,
	}

	log.Println("CheckListCommentReq: 完成")

	return nil, res
}

func CheckUpdateComment(req *handler.UpdateCommentReq) (error, model.Comment) {
	if len(req.ID) == 0 {
		return errors.New("id为空"), model.Comment{}
	}
	var res model.Comment
	res = model.Comment{
		ID:        req.ID,
		UserID:    req.UserID,
		MusicID:   req.MusicID,
		CommentID: req.CommentID,
		Content:   req.Content,
	}
	return nil, res
}

func CheckDeleteComment(req *handler.DeleteCommentReq) (error, filter.DeleteComment) {
	var res filter.DeleteComment
	if len(req.ID) == 0 {
		return errors.New("id为空"), res
	}
	res = filter.DeleteComment{
		ID: req.ID,
	}
	return nil, res
}
