package check

import (
	"errors"
	"log"
	"time"

	"music_system/router/handler"
	"music_system/tool/filter"
)

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
