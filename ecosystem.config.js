module.exports = {
  apps : [{
    name   : "ggoman_back",
    script : "app.js",
    watch: true,
    instances: 2, // cpu 코어수 만큼 프로세스 생성 (instance 항목값을 ‘0’으로 설정하면 CPU 코어 수 만큼 프로세스를 생성)
    exec_mode: 'cluster', // 클러스터 모드
    max_memory_restart: '300M', // 프로세스의 메모리가 300MB에 도달하면 reload 실행
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    // cron_restart: '0 0 0 * *',
  }]
}
