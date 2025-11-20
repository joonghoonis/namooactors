document.addEventListener('DOMContentLoaded', () => {
const header = document.querySelector('header');
if (!header) return;

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const current = window.scrollY;
    const diff = current - lastScrollY;

    // 스크롤 거의 안 움직였으면 무시 (휠 떨림 방지)
    if (Math.abs(diff) < 2) {
    lastScrollY = current;
    return;
    }

    // 1) 방향에 따라 show/hide
    if (diff > 0 && current > 50) {
    // ▼ 아래로 스크롤 중 + 어느 정도 내려왔을 때: 헤더 숨김
    header.classList.add('hide');
    } else if (diff < 0) {
    // ▲ 위로 스크롤 중: 헤더 다시 보이게
    header.classList.remove('hide');
    }

    // 2) 배경 스타일(.scrolled) 처리
    if (current <= 10) {
    // 맨 위 근처면 투명 헤더
    header.classList.remove('scrolled');
    } else {
    // 좀 내려오면 흰 배경/그림자
    header.classList.add('scrolled');
    }

    lastScrollY = current;
});
});
const nowSwiper = new Swiper('#now_swiper', {
autoplay:{delay:6000},
slidesPerView: 'auto',        // 카드 폭을 CSS에서 컨트롤
centeredSlides: true,         // 가운데 슬라이드 정렬
spaceBetween: 20,             // 슬라이드 간격
loop: true,                   // 루프 활성화    
initialSlide:0,
navigation: {
    nextEl: '.now .contents .swiper-button-next',
    prevEl: '.now .contents .swiper-button-prev',
},
});