# novisRPGateway

# 개발 중에는  pm2 delete 0 해서 service manager  에서 중지 시키고
# node novis_uart.js 해서 켜 놓고 
# 다른 창을 열어서 client 접속해서 확인 해 보도록 한다.
# 

# Novistech Gateway nodejs version 1.0.0

# pm2 로 관리합니다.

# 원래 소스는 /home/pi/node 에 있는 내용이고 
# pm2 를 이용해서 novis_uart.js 를 부팅 후 자동 실행합니다.
# 확인 방법은 
# pm2 ls 로 확인하면 

pi@raspberrypi:~/novisRPGateway $ pm2 ls
┌─────┬───────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name          │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼───────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ novis_uart    │ default     │ N/A     │ fork    │ 557      │ 4h     │ 0    │ online    │ 1.8%     │ 45.0mb   │ pi       │ disabled │
└─────┴───────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
pi@raspberrypi:~/novisRPGateway $ 

# 와 같이 출력됩니다.

# 삭제하는 방법은 
pm2 delete 0

pi@raspberrypi:~/novisRPGateway $ pm2 delete 0
[PM2] Applying action deleteProcessId on app [0](ids: 0)
[PM2] [novis_uart](0) ✓
┌─────┬───────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
└─────┴───────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
[PM2][WARN] Current process list running is not in sync with saved list. novis_uart differs. Type 'pm2 save' to synchronize.
pi@raspberrypi:~/novisRPGateway $ 

# 와 같이 삭제가 됩니다.

# 다시 등록하는 방법은 
pm2 start novis_uart.js

pi@raspberrypi:~/novisRPGateway $ pm2 start novis_uart.js 
[PM2] Starting /home/pi/novisRPGateway/novis_uart.js in fork_mode (1 instance)
[PM2] Done.
┌─────┬───────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name          │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼───────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ novis_uart    │ default     │ 1.0.0   │ fork    │ 22798    │ 0s     │ 0    │ online    │ 0%       │ 18.9mb   │ pi       │ disabled │
└─────┴───────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
pi@raspberrypi:~/novisRPGateway $ 


# 마지막으로 이 모든 내용을 저장해야 재 부팅 후도 정상적으로 동작합니다.

pm2 save 


# 현재 동작하는 로컬 포트 확인 방법

netstat -tnlp

pi@raspberrypi:~/novisRPGateway $ netstat -tnlp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 127.0.0.1:44623         0.0.0.0:*               LISTEN      20015/node          
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -                   
tcp6       0      0 :::10001                :::*                    LISTEN      22798/node /home/pi 
tcp6       0      0 :::22                   :::*                    LISTEN      -                   


# npm update 를 실행해서 최종 버전을 만들었다.

# npm install 은 node_module 이 없을 경우 실행 하세요.