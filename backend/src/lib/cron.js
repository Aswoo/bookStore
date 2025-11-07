import cron from "cron";
import https from "https";

// ⚠️ 주의: 무료 호스팅 서비스들은 Cron Job을 제한할 수 있습니다
// Render, Railway 등은 과도한 keep-alive 요청을 감지하면 계정을 제한할 수 있습니다

// 환경 변수로 Cron Job 활성화/비활성화 제어
const ENABLE_CRON = process.env.ENABLE_CRON === "true";
const CRON_INTERVAL = process.env.CRON_INTERVAL || "*/30 * * * *"; // 기본값: 30분마다

// Cron Job 생성 (비활성화 시 빈 객체 반환)
const job = ENABLE_CRON
  ? new cron.CronJob(CRON_INTERVAL, function () {
      if (!process.env.API_URL) {
        console.warn("API_URL 환경 변수가 설정되지 않았습니다.");
        return;
      }
      https
        .get(process.env.API_URL, (res) => {
          if (res.statusCode === 200)
            console.log("Keep-alive request sent successfully");
          else console.log("Keep-alive request failed", res.statusCode);
        })
        .on("error", (e) =>
          console.error("Error while sending keep-alive request", e)
        );
    })
  : {
      start: () => console.log("Cron Job is disabled"),
      stop: () => {},
    };

export default job;

// ============================================
// CRON JOB 대안 방법들 (무료 호스팅 친화적)
// ============================================
//
// 1. 외부 Keep-Alive 서비스 사용 (추천!)
//    - UptimeRobot (무료): https://uptimerobot.com
//    - Pingdom (무료 플랜 있음)
//    - 이 서비스들이 주기적으로 서버를 핑하므로 Cron Job 불필요
//
// 2. 주기 늘리기
//    - 14분 → 30분 또는 1시간으로 변경
//    - .env에 CRON_INTERVAL="0 * * * *" (매 시간) 설정
//
// 3. 유료 플랜 사용
//    - Render: $7/월 (Always On)
//    - Railway: $5/월 (Always On)
//    - Heroku: $7/월 (Hobby)
//
// 4. 다른 호스팅 서비스
//    - Fly.io: 무료 플랜에 Always On 옵션
//    - Render: 무료 플랜은 15분 비활성 시 슬립
//
// ============================================
// CRON 표현식 설명
// ============================================
// 형식: MINUTE, HOUR, DAY OF MONTH, MONTH, DAY OF WEEK
//
// 예시:
// "*/30 * * * *" - 30분마다
// "0 * * * *"    - 매 시간 정각
// "0 */2 * * *"  - 2시간마다
// "0 0 * * *"    - 매일 자정
