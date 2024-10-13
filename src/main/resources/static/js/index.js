//index.js

document.addEventListener("DOMContentLoaded", function () {
    var gif = document.getElementById("myGif");
    var fallbackImage = document.getElementById("fallbackImage");

    // 페이지 로드 시 1회 자동 재생
    gif.style.display = "block";
    fallbackImage.style.display = "none";

    // 자동 재생 후 GIF 숨기기 (자동 반복 방지) 및 대체 이미지 표시
    setTimeout(function () {
        gif.style.display = "none";
        fallbackImage.style.display = "block"; // 대체 이미지 표시
    }, 3000); // GIF의 재생 시간에 맞춰 조정

    // 마우스를 갖다 댔을 때 재생
    document.querySelector('.animation-container').addEventListener("mouseenter", function () {
        gif.style.display = "block";
        fallbackImage.style.display = "none"; // 대체 이미지 숨기기
    });

    // 마우스를 떼었을 때 GIF 숨기기 및 대체 이미지 표시
    document.querySelector('.animation-container').addEventListener("mouseleave", function () {
        gif.style.display = "none";
        fallbackImage.style.display = "block"; // 대체 이미지 표시
    });
});

document.querySelectorAll('.schedule-box').forEach(box => {
    box.addEventListener('mouseenter', () => {
        console.log('Mouse entered');  // 로그 확인
        box.classList.add('blink');
    });

    box.addEventListener('mouseleave', () => {
        console.log('Mouse left');  // 로그 확인
        box.classList.remove('blink');
    });
});
document.querySelectorAll('.task-type-preference .task-option').forEach(option => {
    option.addEventListener('click', () => {
        // 모든 옵션에서 selected 클래스를 제거
        document.querySelectorAll('.task-type-preference .task-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // 클릭한 옵션에 selected 클래스 추가
        option.classList.add('selected');

        // 선택된 값(hidden input에 저장)
        document.getElementById('taskType').value = option.getAttribute('data-task');
    });
});

    // 슬라이더 값 표시 업데이트
    const difficultySlider = document.getElementById('difficulty');
    const difficultyValue = document.getElementById('difficultyValue');
    const stressSlider = document.getElementById('stress');
    const stressValue = document.getElementById('stressValue');
    const urgencySlider = document.getElementById('urgency');
    const urgencyValue = document.getElementById('urgencyValue');
    const importanceSlider = document.getElementById('importance');
    const importanceValue = document.getElementById('importanceValue');

    const sliders = [
        { slider: difficultySlider, value: difficultyValue },
        { slider: stressSlider, value: stressValue },
        { slider: urgencySlider, value: urgencyValue },
        { slider: importanceSlider, value: importanceValue }
    ];

    sliders.forEach(({ slider, value }) => {
        if (slider && value) {
            value.textContent = slider.value;
            slider.addEventListener('input', () => {
                value.textContent = slider.value;
            });
        } else {
            console.error("Slider or value element not found.");
        }
    });


//시간예측 슬라이더
// 시간예측 슬라이더
var predictSlider = document.getElementById('predictSlider');
noUiSlider.create(predictSlider, {
    start: 0,
    connect: [true, false],
    range: {
        'min': 0,
        'max': 180
    },
    step: 1,
    tooltips: true,
    format: {
        to: function (value) {
            return Math.round(value) + '분';
        },
        from: function (value) {
            return Number(value.replace('분', ''));
        }
    },
    pips: {
        mode: 'values',
        values: [30, 60, 90, 120, 150, 180],
        density: 4
    }
});

// 슬라이더 값이 변경될 때마다 선택된 시간을 업데이트
predictSlider.noUiSlider.on('update', function (values, handle) {
    document.getElementById('timeValue').textContent = values[handle];
    document.getElementById('estimatedTime').value = values[handle].replace('분', '');
});

// 작업 유형에 따른 슬라이더 업데이트
document.querySelectorAll('.task-type-preference .task-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.task-type-preference .task-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');

        const taskType = option.getAttribute('data-task');
        document.getElementById('taskType').value = taskType;

        // 작업 유형에 따른 평균 시간 설정
        let minTime, maxTime;
        switch (taskType) {
            case '운동':
                minTime = 30;
                maxTime = 60;
                break;
            case '회의':
                minTime = 30;
                maxTime = 60;
                break;
            case '보고서 작성':
                minTime = 120;
                maxTime = 180;
                break;
            case '학습':
                minTime = 90;
                maxTime = 120;
                break;
            case '가사일':
                minTime = 150;
                maxTime = 180;
                break;
            case '창의적인 작업':
                minTime = 60;
                maxTime = 120;
                break;
        }

        // 슬라이더 구간 업데이트
        predictSlider.noUiSlider.updateOptions({
            range: {
                'min': 0,
                'max': 180
            },
            pips: {
                mode: 'values',
                values: [30, 60, 90, 120, 150, 180],
                density: 4
            }
        });

        // 슬라이더 바의 배경에 평균 시간 구간 색상 표시
        let sliderBar = document.querySelector('.noUi-base');
        let backgroundStyle = `linear-gradient(
            to right,
            #ddd 0%, 
            #ddd ${(minTime / 180) * 100}%, 
            rgba(255, 255, 0, 0.5) ${(minTime / 180) * 100}%, 
            rgba(255, 255, 0, 0.5) ${(maxTime / 180) * 100}%, 
            #ddd ${(maxTime / 180) * 100}%, 
            #ddd 100%)`;

        // 슬라이더 바 배경 업데이트
        sliderBar.style.background = backgroundStyle;
    });
});

// 슬라이더 업데이트 시 평균 시간 구간을 유지
predictSlider.noUiSlider.on('slide', function () {
    // 슬라이더가 움직일 때도 평균 시간 구간을 계속 유지
    let taskType = document.getElementById('taskType').value;
    let minTime, maxTime;
    switch (taskType) {
        case '운동':
            minTime = 30;
            maxTime = 60;
            break;
        case '회의':
            minTime = 30;
            maxTime = 60;
            break;
        case '보고서 작성':
            minTime = 120;
            maxTime = 180;
            break;
        case '학습':
            minTime = 90;
            maxTime = 120;
            break;
        case '가사일':
            minTime = 150;
            maxTime = 180;
            break;
        case '창의적인 작업':
            minTime = 60;
            maxTime = 120;
            break;
    }

    let sliderBar = document.querySelector('.noUi-base');
    let backgroundStyle = `linear-gradient(
        to right,
        #ddd 0%, 
        #ddd ${(minTime / 180) * 100}%, 
        rgba(255, 255, 0, 0.5) ${(minTime / 180) * 100}%, 
        rgba(255, 255, 0, 0.5) ${(maxTime / 180) * 100}%, 
        #ddd ${(maxTime / 180) * 100}%, 
        #ddd 100%)`;

    sliderBar.style.background = backgroundStyle;
});