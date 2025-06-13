/**
 * 營業時間處理類別
 */
class BusinessHours {
    constructor() {
        this.DEBUG = true; // 是否輸出調試信息
    }

    /**
     * 解析時間字串為分鐘數
     * @param {string} timeStr - 時間字串 (格式: "HH:mm")
     * @returns {number} - 轉換後的分鐘數
     */
    parseTimeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
        return hours * 60 + (minutes || 0);
    }

    /**
     * 獲取當前時間的分鐘數
     * @returns {number} - 當前時間的分鐘數
     */
    getCurrentMinutes() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }

    /**
     * 判斷是否在營業時間內
     * @param {string} openTime - 開始營業時間 (格式: "HH:mm")
     * @param {string} closeTime - 結束營業時間 (格式: "HH:mm")
     * @returns {boolean} - 是否營業中
     */
    isOpenNow(openTime, closeTime) {
        // 確保時間格式正確
        if (!openTime.includes(':')) openTime = `${openTime}:00`;
        if (!closeTime.includes(':')) closeTime = `${closeTime}:00`;

        const startMin = this.parseTimeToMinutes(openTime);
        let endMin = this.parseTimeToMinutes(closeTime);
        const nowMin = this.getCurrentMinutes();

        // 調試信息
        if (this.DEBUG) {
            console.log('[BusinessHours] 營業時間判斷:', {
                openTime,
                closeTime,
                startMin,
                endMin,
                nowMin,
                currentTime: new Date().toLocaleTimeString()
            });
        }

        // 處理跨日營業的情況 (結束時間小於開始時間，表示跨日)
        if (endMin < startMin) {
            endMin += 24 * 60; // 將結束時間加上24小時
            
            if (this.DEBUG) {
                console.log('[BusinessHours] 跨日營業檢測:', {
                    adjustedEndMin: endMin,
                    condition: `${startMin} <= ${nowMin} 或 ${nowMin} <= ${endMin - 24 * 60}`
                });
            }

            // 跨日營業有兩種情況：
            // 1. 現在時間 >= 開始時間 (今天的營業時段)
            // 2. 現在時間 <= 結束時間 (隔天的營業時段，需要調整結束時間)
            return nowMin >= startMin || nowMin <= (endMin - 24 * 60);
        }

        // 一般營業時間判斷
        const isOpen = nowMin >= startMin && nowMin <= endMin;
        
        if (this.DEBUG) {
            console.log('[BusinessHours] 一般營業時間判斷:', {
                isOpen,
                condition: `${startMin} <= ${nowMin} <= ${endMin}`
            });
        }

        return isOpen;
    }

    /**
     * 解析營業時間文字並判斷是否營業中
     * @param {string} businessHoursText - 營業時間文字 (例如: "11:00-02:00")
     * @returns {boolean} - 是否營業中
     */
    isOpenFromText(businessHoursText) {
        if (!businessHoursText) return false;

        // 處理全形符號
        const normalizedText = businessHoursText
            .replace(/：/g, ':')
            .replace(/[－—–]/g, '-')
            .replace(/～/g, '-');

        // 如果包含休息相關文字，直接返回false
        if (/休息|公休|無營業/.test(normalizedText)) {
            return false;
        }

        // 調試信息
        if (this.DEBUG) {
            console.log('[BusinessHours] 解析營業時間:', {
                original: businessHoursText,
                normalized: normalizedText,
                currentTime: new Date().toLocaleTimeString()
            });
        }

        const periods = normalizedText.split(',').map(p => p.trim());
        
        // 檢查每個營業時段
        for (const period of periods) {
            const timeRange = period.match(/(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)/);
            if (timeRange) {
                const [_, start, end] = timeRange;
                // 確保時間格式正確（添加分鐘如果沒有）
                const startTime = start.includes(':') ? start : `${start}:00`;
                const endTime = end.includes(':') ? end : `${end}:00`;
                
                if (this.DEBUG) {
                    console.log('[BusinessHours] 檢查時段:', {
                        start: startTime,
                        end: endTime
                    });
                }

                if (this.isOpenNow(startTime, endTime)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 格式化營業時間顯示
     * @param {string} businessHoursText - 營業時間文字
     * @returns {string} - 格式化後的顯示文字
     */
    formatDisplayTime(businessHoursText) {
        if (!businessHoursText) return '未提供營業時間';
        
        const isOpen = this.isOpenFromText(businessHoursText);
        return `${isOpen ? '營業中' : '休息中'} (${businessHoursText})`;
    }

    /**
     * 從 Google Places API 的 weekday_text 獲取今日營業時間
     * @param {Array<string>} weekdayText - Google Places API 的 weekday_text
     * @returns {string} - 今日營業時間
     */
    getTodayHours(weekdayText) {
        if (!Array.isArray(weekdayText)) return null;

        const today = new Date().getDay();
        // 轉換星期幾的索引 (API中 0=週一, 6=週日)
        const index = today === 0 ? 6 : today - 1;
        
        const todayText = weekdayText[index];
        if (!todayText) return null;

        // 分割日期和時間，只返回時間部分
        const timePart = todayText.split(/：|:/)[1]?.trim();
        
        // 調試信息
        if (this.DEBUG) {
            console.log('[BusinessHours] 獲取今日營業時間:', {
                today,
                index,
                todayText,
                timePart
            });
        }
        
        return timePart || null;
    }
}

// 創建全局實例
window.businessHours = new BusinessHours(); 