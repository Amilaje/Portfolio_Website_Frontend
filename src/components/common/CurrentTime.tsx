import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Box, Grid, Divider, Paper, useTheme } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // 위치
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // 시계 아이콘

// OpenWeatherMap API 설정 (사용자의 정보 기반)
const OPEN_WEATHER_API_KEY = '356b0e745a6ac078a2e34e47708e8580';
const CITY_NAME = 'Daejeon';
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&units=Metric&appid=${OPEN_WEATHER_API_KEY}`;

// 날씨 데이터 타입 정의
interface WeatherData {
    location: string;
    temp: number | null;
    condition: string;
    icon: string; // OpenWeatherMap 아이콘 코드 (예: '01d')
    loading: boolean;
}

// 실시간 현재 시각 및 날씨를 표시하는 컴포넌트
const CurrentTimeAndWeather: React.FC = () => {
    const theme = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // 1. 날씨 데이터 상태를 OpenWeatherMap 응답에 맞게 초기화
    const [weather, setWeather] = useState<WeatherData>({ 
        location: '대전광역시', 
        temp: null, 
        condition: '로딩 중',
        icon: '',
        loading: true
    });

    // 2. 현재 시각 업데이트 타이머
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    // 3. OpenWeatherMap API 호출 (날씨 데이터 로딩)
    useEffect(() => {
        fetch(WEATHER_API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                setWeather({
                    location: result.name || '대전광역시', // API에서 도시 이름 사용
                    temp: Math.round(result.main.temp), // 소수점 제거
                    condition: result.weather[0].description, // 상세 설명
                    icon: result.weather[0].icon,
                    loading: false
                });
            })
            .catch(err => {
                console.error("날씨 API 호출 오류:", err);
                setWeather(prev => ({
                    ...prev,
                    condition: '정보 없음', // 오류 발생 시
                    loading: false
                }));
            });
    }, []);

    // 시간 및 날짜 포맷
    const formattedDate = useMemo(() => currentTime.toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    }), [currentTime]);

    const formattedTime = useMemo(() => currentTime.toLocaleTimeString('ko-KR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }), [currentTime]);
    
    // OpenWeatherMap 아이콘 URL 생성
    const weatherIconUrl = weather.icon 
        ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
        : '';
        
    const displayTemp = weather.temp !== null ? `${weather.temp}°C` : 'N/A';
    
    return (
        <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
                
                {/* 1. 현재 시각 */}
                <Grid 
                    item // Grid item으로 변경
                    xs={12} 
                    sm={6}
                    sx={{ 
                        padding: theme.spacing(1) 
                    }}
                >
                    <Box sx={{ 
                        textAlign: { xs: 'center', sm: 'left' },
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: { xs: 'center', sm: 'flex-start' }
                    }}>
                        <Box display="flex" alignItems="center">
                            <AccessTimeIcon sx={{ mr: 1, fontSize: 30, color: 'primary.dark' }} />
                            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                {formattedTime}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {formattedDate}
                        </Typography>
                    </Box>
                </Grid>

                {/* 분리선 (모바일에서는 숨김) */}
                <Divider orientation="vertical" flexItem sx={{ 
                    display: { xs: 'none', sm: 'block' }, 
                    height: 60, 
                    mx: 1 
                }} />

                {/* 2. 현재 날씨 */}
                <Grid 
                    item // Grid item으로 변경
                    xs={12} 
                    sm={6} // 남은 공간을 사용하도록 sm={6}으로 설정
                    sx={{ 
                        padding: theme.spacing(1)
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                        
                        {/* 🚨 [수정된 부분]: OpenWeatherMap 아이콘 이미지 사용 */}
                        {weather.loading ? (
                             <Typography variant="body2">로딩 중...</Typography>
                        ) : weatherIconUrl ? (
                            // API에서 받은 아이콘 URL을 사용하여 이미지 표시
                            <img 
                                src={weatherIconUrl} 
                                alt={weather.condition} 
                                style={{ width: 60, height: 60, marginRight: theme.spacing(1) }} 
                            />
                        ) : (
                            <Typography variant="body2" color="error">날씨 정보 없음</Typography>
                        )}
                        {/* ---------------------------------------------------- */}

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <LocationOnIcon fontSize="small" color="action" />
                                <Typography variant="body1" sx={{ ml: 0.5, fontWeight: 600 }}>
                                    {weather.location}
                                </Typography>
                            </Box>
                            <Typography variant="h5" color="text.primary" fontWeight={700}>
                                {displayTemp} ({weather.condition})
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default CurrentTimeAndWeather;