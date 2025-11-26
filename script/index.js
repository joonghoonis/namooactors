/* ===============main~artist============== */
let isVerticalSliding = false;
document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // 1. Main Swiper (Vertical)
    // =========================
    const mainSwiper = new Swiper('#fullpageSwiper', {
        direction: 'vertical',
        speed: 800,
        slidesPerView: 1,
        mousewheel: { enabled: true },
        on: {
            transitionEnd(swiper) {
                isVerticalSliding = false;
                if (swiper.mousewheel) swiper.mousewheel.enable();
            },
        },
    });

    // =========================
    // 2. Artist Swiper (Horizontal)
    // =========================
    const artistSwiper = new Swiper('#artistSwiper', {
        direction: 'horizontal',
        slidesPerView: 'auto',
        spaceBetween: 50,
        freeMode: true,
        nested: true,
    });
    // =========================
    // 3. Artist Cards
    // =========================
    // 이미지 카드 6장
    const artistImageCards = document.querySelectorAll(
        '#artistSwiper .artist_card:not(.artist_more)'
    );
    const totalImageCards = artistImageCards.length;

    // 마지막 More View 카드
    const moreCard = document.querySelector('#artistSwiper .artist_more');

    // hero = 0, artist = 1 이면 1
    const ARTIST_INDEX = 1;

    // --- 카드 개수 계산 로직 ---
    function getVisibleCountByProgress(progress) {
        // progress 0일 때는 0장 (→ 완전 왼쪽으로 올리면 전부 사라지게)
        if (progress <= 0) return 0;

        // 카드별 등장 시점 (점점 텀 길어지는 구조)
        const t2 = 0.08; // 2번
        const t3 = 0.20; // 3번
        const t4 = 0.40; // 4번
        const t5 = 0.62; // 5번
        const t6 = 0.80; // 6번

        let count = 1; // 기본 1장 (1번)

        if (progress >= t2) count = 2;
        if (progress >= t3) count = 3;
        if (progress >= t4) count = 4;
        if (progress >= t5) count = 5;
        if (progress >= t6) count = 6;

        if (count > totalImageCards) count = totalImageCards;
        return count;
    }

    function updateArtistCardsByProgress() {
        const progress = artistSwiper.progress || 0;
        const visibleCount = getVisibleCountByProgress(progress);

        // 이미지 카드 6장 처리
        artistImageCards.forEach((card, idx) => {
            if (idx < visibleCount) {
                card.classList.add('is-visible');
            } else {
                card.classList.remove('is-visible');
            }
        });

        // More View 카드: 거의 끝쯤에서 등장 → 필요하면 값 조절
        if (moreCard) {
            const moreThreshold = 0.7; // 0.7쯤에서 more view 나옴
            if (progress >= moreThreshold) {
                moreCard.classList.add('is-visible');
            } else {
                moreCard.classList.remove('is-visible');
            }
        }
    }

    // 초기 상태: 전부 숨김
    artistSwiper.updateProgress();
    updateArtistCardsByProgress();

    // Artist 섹션에 도착했을 때: 1번만 먼저 보여주고 시작
    mainSwiper.on('slideChangeTransitionEnd', () => {
        if (mainSwiper.activeIndex === ARTIST_INDEX) {
            // 처음 진입 시 1번 카드만 보이게
            if (artistImageCards[0]) {
                artistImageCards[0].classList.add('is-visible');
            }
        }
    });

    // =========================
    // 4. Artist wheel custom
    // =========================
    const artistSection = document.querySelector('#artist');
    let endReady = false;
    let startReady = false;

    if (artistSection) {
        artistSection.addEventListener(
            'wheel',
            (e) => {
                const dy = e.deltaY;

                if (isVerticalSliding) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                const current = artistSwiper.getTranslate();
                const speed = 0.6;

                const min = artistSwiper.maxTranslate();
                const max = artistSwiper.minTranslate();

                let target = current - dy * speed;

                if (target < min) target = min;
                if (target > max) target = max;

                artistSwiper.setTranslate(target);
                artistSwiper.updateProgress();
                artistSwiper.updateActiveIndex();
                artistSwiper.updateSlidesClasses();

                // 👉 가로 이동한 만큼 카드 오픈/닫기
                updateArtistCardsByProgress();

                // ===== 아래 방향 (다음 섹션) =====
                if (dy > 0) {
                    startReady = false;

                    if (!artistSwiper.isEnd) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    if (!endReady) {
                        endReady = true;
                        return;
                    }

                    endReady = false;
                    isVerticalSliding = true;
                    if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
                    mainSwiper.slideNext();
                    return;
                }

                // ===== 위 방향 (이전 섹션) =====
                if (dy < 0) {
                    endReady = false;

                    if (!artistSwiper.isBeginning) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    if (!startReady) {
                        startReady = true;
                        return;
                    }

                    startReady = false;
                    isVerticalSliding = true;
                    if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
                    mainSwiper.slidePrev();
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
            },
            { passive: false }
        );
    }
setupMediaScrollSequence(mainSwiper);
setupFilmoScrollSequence(mainSwiper);
setupAudiScroll(mainSwiper);
});
/* ===============미디어 카테고리===================== */
  const mediaCategoryItems = document.querySelectorAll('#media .category li');
    const mediaPanels = document.querySelectorAll('#media .media_contents > div');

    if (mediaCategoryItems.length && mediaPanels.length) {
        // 초기 상태: 0번(INTERVIEW) 활성화
        let activeIndex = 0;

        function updateMediaCategory(index) {
            activeIndex = index;

            // 1) 카테고리 색 그라데이션(depth-0 ~ depth-3)
            mediaCategoryItems.forEach((li, idx) => {
                li.classList.remove('depth-0', 'depth-1', 'depth-2', 'depth-3');

                const diff = Math.abs(idx - activeIndex);
                const depth = Math.min(diff, 3); // 3칸 이상은 전부 depth-3

                li.classList.add(`depth-${depth}`);
            });

            // 2) 패널 show/hide
            mediaPanels.forEach((panel, idx) => {
                panel.classList.toggle('is-active', idx === activeIndex);
            });
        }

        // 초기 호출
        updateMediaCategory(activeIndex);

        // 클릭 이벤트
        mediaCategoryItems.forEach((li, idx) => {
            const btn = li.querySelector('button');
            if (!btn) return;

            btn.addEventListener('click', () => {
                updateMediaCategory(idx);
            });
        });
    }

/* =============미디어======================= */
function setupMediaScrollSequence(mainSwiper) {
    const MEDIA_INDEX = 2; // hero=0, artist=1, media=2 라고 가정

    const mediaSlide = document.querySelector('#media');
    if (!mediaSlide) return;

    const mediaScroll = mediaSlide.querySelector('.media_scroll');
    if (!mediaScroll) return;

    const text1Els = mediaSlide.querySelectorAll('.brand_1 .text1');
    const text2Els = mediaSlide.querySelectorAll('.brand_1 .text2');
    const text3Els = mediaSlide.querySelectorAll('.brand_1 .text3');
    const mediaInner = mediaSlide.querySelector('.media_inner');

    if (!text1Els.length || !text2Els.length || !text3Els.length || !mediaInner) return;

    let step = 0;                // 0~4
    let sequenceCompleted = false; // step 4까지 한 번 끝났는지 여부

    function clearTextClasses() {
        [...text1Els, ...text2Els, ...text3Els].forEach(el => {
            el.classList.remove('text-show', 'text-hide');
        });
        mediaInner.classList.remove('media-visible');
    }

    function addClassToAll(list, className) {
        list.forEach(el => el.classList.add(className));
    }

    // 현재 step 상태를 DOM에 반영
    function applyStep() {
        clearTextClasses();

        if (step === 1) {
            addClassToAll(text1Els, 'text-show');
        }
        if (step === 2) {
            addClassToAll(text1Els, 'text-show');
            addClassToAll(text2Els, 'text-show');
        }
        if (step === 3) {
            addClassToAll(text1Els, 'text-show');
            addClassToAll(text2Els, 'text-show');
            addClassToAll(text3Els, 'text-show');
        }
        if (step >= 4) {
            addClassToAll(text1Els, 'text-hide');
            addClassToAll(text2Els, 'text-hide');
            addClassToAll(text3Els, 'text-hide');
            mediaInner.classList.add('media-visible');
        }
        // step 0은 전부 숨김 상태
    }

function resetStateToIntro() {
    // 위에서 내려올 때(artist → media) 초기 상태
    step = 0;
    sequenceCompleted = false;
    clearTextClasses();
    mediaScroll.scrollTop = 0;
    applyStep();
}

    function setStateToCompletedFromBottom() {
        // 아래에서 올라올 때(filmo → media) 상태
        step = 4;
        sequenceCompleted = true;

        clearTextClasses();
        addClassToAll(text1Els, 'text-hide');
        addClassToAll(text2Els, 'text-hide');
        addClassToAll(text3Els, 'text-hide');
        mediaInner.classList.add('media-visible');

        // 아래에서 올라오는 느낌 주고 싶으면 맨 아래로 세팅
        mediaScroll.scrollTop = mediaScroll.scrollHeight;
    }

    // ✅ 슬라이드 이동 방향에 따라 media 상태 초기화
    mainSwiper.on('slideChangeTransitionStart', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        // artist(1) → media(2) : 위에서 내려오는 방향 → 인트로 모드
        if (curr === MEDIA_INDEX && prev < MEDIA_INDEX) {
            resetStateToIntro();
        }

        // filmo(3) → media(2) : 아래에서 올라오는 방향 → 완료 모드(역재생 준비)
        if (curr === MEDIA_INDEX && prev > MEDIA_INDEX) {
            setStateToCompletedFromBottom();
        }
    });
mainSwiper.on('slideChangeTransitionEnd', (swiper) => {
    const prev = swiper.previousIndex;
    const curr = swiper.activeIndex;

    // 위에서 내려와서 media에 "도착을 딱 했을 때" → text1 보여주기
    if (curr === MEDIA_INDEX && prev < MEDIA_INDEX) {
        step = 1;                 // text1 단계
        sequenceCompleted = false;
        applyStep();              // text1에 .text-show 적용
    }
});
    // 초기 진입 상태 반영 (혹시 시작부터 media인 경우 대비)
    applyStep();

    // ================= wheel 핸들러 =================
    mediaScroll.addEventListener('wheel', (e) => {
        const dy = e.deltaY;

        // media 슬라이드가 아닐 땐 이 함수 아예 관여 안 함
        if (mainSwiper.activeIndex !== MEDIA_INDEX) return;

        const el = e.currentTarget;
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;

        // 세로 슬라이드 중이면 휠 무시
        if (isVerticalSliding) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

       // =========================
// 1) 인트로 연출 구간 (step 0~3)
//   - 이때는 항상 scrollTop = 0 근처라고 가정
// =========================
if (step < 4) {
    e.preventDefault();
    e.stopPropagation();

    if (dy > 0) {
        // 아래로 → 0→1→2→3→4
        if (step < 4) {
            step++;
            applyStep();
            if (step === 4) {
                sequenceCompleted = true;
            }
        }
    } else if (dy < 0) {
        // ===== 위로 스크롤 (단계 되감기 / 이전 섹션) =====

        // 3,2일 때는 단계만 줄이기 (3→2, 2→1)
        if (step > 1) {
            step -= 1;
            applyStep();
            return;
        }

        // step === 1 (text1만 보이는 상태)
        // → text1을 사라지게 만들고, 동시에 이전 섹션(artist)로 이동
        if (step === 1) {
            step = 0;
            sequenceCompleted = false;   // 인트로 모드로 복귀
            applyStep();                 // text1 숨김 (페이드아웃 시작)

            isVerticalSliding = true;
            if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
            mainSwiper.slidePrev();
            return;
        }

        // step === 0인 상태에서 위로 → 바로 artist로
        if (step === 0) {
            isVerticalSliding = true;
            if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
            mainSwiper.slidePrev();
            return;
        }
    }
    return;
}


        // =========================
        // 2) 실제 스크롤 + 역재생 구간 (step >= 4)
        // =========================
        if (step >= 4 && sequenceCompleted) {

            // A. 위로 스크롤 + 맨 위 → 역재생 진입 (mediaInner → 텍스트)
            if (atTop && dy < 0) {
                e.preventDefault();
                e.stopPropagation();

                step = 3; // 텍스트 3줄 상태로 되감기 시작
                sequenceCompleted = false;
                applyStep();
                return;
            }

            // B. 맨 아래 + 아래로 → 다음 섹션으로 넘어가기
            if (atBottom && dy > 0) {
                // ❗ 여기서 Swiper한테 맡김 (slideNext 직접 호출 X)
                // → 덜컹거림 줄어듦
                // 이벤트는 그냥 통과시켜서 mainSwiper의 mousewheel이 처리하게 둠
                return;
            }

            // C. 그 외(중간 구간) → mediaScroll 안에서만 스크롤, Swiper에는 이벤트 전달 막기
            e.stopPropagation(); // 기본 스크롤은 그대로 (scrollTop 증가), Swiper만 못 듣게
            return;
        }

        // 안전빵: 기타 상황에서는 Swiper로 이벤트 넘기지 않게만 처리
        e.stopPropagation();
    }, { passive: false });
}
/* =======================filmography===================== */
// =======================================================
// JS FUNCTION - 필모그래피 콘텐츠 업데이트 (유지)
// =======================================================
function updateFilmography(year) {
    const allViews = document.querySelectorAll('.filmo_inner .contents .view');
    allViews.forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.querySelector(`.filmo_inner .contents .view[data-year="${year}"]`);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// ❌ updateFadeClasses 함수는 이제 필요 없으므로 제거됩니다.
// =======================================================
// DOM CONTENT LOADED
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library is not loaded. Please ensure you have included the Swiper JS file.');
        return;
    }
    
    // 1. Swiper 초기화 (최종 설정 유지)
    const yearsSwiper = new Swiper('.years_list.swiper', {
        direction: 'vertical',         
        slidesPerView: 'auto',              
        centeredSlides: true,          
        spaceBetween: 7, 
        
        // 드래그 기능 제거 유지
        touchRatio: 0, 
        grabCursor: false, 
        
        speed: 300, 
        resistanceRatio: 0, 
        setWrapperSize: true, 
        
        // 마우스 휠 스크롤 설정 유지
        mousewheel: {
            enabled: true,
            eventTarget: '.years_list.swiper', 
            releaseOnEdges: false,       
            forceToAxis: true,           
            sensitivity: 1.0, 
        },
        
        nested: true,                   
        loop: false,
    });

// 2. Swiper 슬라이드 이동 중 이벤트 처리 (Progress 기반 투명도 계산)
yearsSwiper.on('setTranslate', function () {
    const swiper = this;
    
    for (let i = 0; i < swiper.slides.length; i++) {
        const slide = swiper.slides[i];
        const slideButton = slide.querySelector('button');
        
        // 중앙으로부터 얼마나 떨어져 있는지 나타내는 값 (중앙일 때 0, 다음 슬라이드일 때 1, 2칸 떨어졌을 때 2)
        let absProgress = Math.abs(swiper.slides[i].progress); 
        let opacity;
        
        if (absProgress < 1) {
            // P=0 (Active) → P=1 (Next/Prev) : 1.0에서 0.6으로 부드럽게 감소
            // (1.0 - 0.4)
            opacity = 1.0 - (absProgress * 0.4); 
        } else if (absProgress < 2) {
            // P=1 → P=2 (Next/Prev-2) : 0.6에서 0.4로 부드럽게 감소
            // (0.6 - 0.2)
            let fractionalProgress = absProgress - 1; // P=1에서 시작 (0 ~ 1 사이 값)
            opacity = 0.6 - (fractionalProgress * 0.2); 
        } else if (absProgress < 3) {
            // P=2 → P=3 : 0.4에서 0.2로 부드럽게 감소
            // (0.4 - 0.2)
            let fractionalProgress = absProgress - 2; // P=2에서 시작 (0 ~ 1 사이 값)
            opacity = 0.4 - (fractionalProgress * 0.2);
        } else {
            // P=3 이상: 최소 투명도 0.2로 고정
            opacity = 0.2;
        }

        // 최종적으로 opacity 값을 슬라이드 버튼에 인라인 스타일로 적용
        if (slideButton) {
             slideButton.style.opacity = opacity;
             
             // 활성화된 슬라이드는 항상 #fff 색상을 유지하도록 CSS로 처리
             if (!slide.classList.contains('swiper-slide-active')) {
                 slideButton.style.color = `rgba(255, 255, 255, ${opacity * 0.9 + 0.1})`;
             }
        }
    }
});
// ... (나머지 JS 코드 유지)
    // 3. Swiper 슬라이드 변경 완료 이벤트 처리 (컨텐츠 업데이트용)
    yearsSwiper.on('slideChangeTransitionEnd', function () {
        const activeSlide = yearsSwiper.slides[yearsSwiper.activeIndex];
        const button = activeSlide.querySelector('button');
        if (button) {
            const currentYear = button.dataset.year;
            updateFilmography(currentYear);
        }
        // ✅ 클래스 기반이 아니므로 updateFadeClasses 호출 제거
        // 하지만 투명도 계산은 setTranslate에서 지속적으로 이루어짐
    });

    // 4. 연도 버튼 클릭 이벤트 처리 (유지)
    const yearButtons = document.querySelectorAll('.filmo_years button');
    yearButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); 
            const clickedYear = event.currentTarget.dataset.year;
            
            let targetIndex = -1;
            const slides = yearsSwiper.slides;
            
            for (let i = 0; i < slides.length; i++) {
                const slideButton = slides[i].querySelector('button');
                if (slideButton && slideButton.dataset.year === clickedYear) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex !== -1) {
                yearsSwiper.slideTo(targetIndex);
                updateFilmography(clickedYear);
                // 클릭 시에도 클래스 기반이 아니므로 updateFadeClasses 호출 제거
            }
        });
    });

    // 5. 상위 섹션 넘어가는 문제 해결 로직 (유지)
    const swiperContainer = document.querySelector('.years_list.swiper');
    if (swiperContainer) {
        swiperContainer.addEventListener('wheel', (event) => {
            event.stopPropagation();
        }, { passive: false }); 
    }
    
    // 초기 로드 시
    const initialButton = yearsSwiper.slides[yearsSwiper.activeIndex].querySelector('button');
    if (initialButton) {
        updateFilmography(initialButton.dataset.year);
    }
    
    // ✅ 초기 로드 시 수동으로 setTranslate 이벤트 트리거
    yearsSwiper.emit('setTranslate');
});
/* ====================swiper poster=========================== */

const posterSwiper = new Swiper("#posters", {
    effect: "cube",
    grabCursor: true,
    autoplay: {
        delay: 1800
    },
    loop:true,
    speed:1200,
    cubeEffect: {
      shadow: true,
      slideShadows: true,
      shadowOffset: 20,
      shadowScale: 0.94,
    },
    pagination: {
      el: "#posters .swiper-pagination",
    },
  });
/* =================filmography fadein================= */
function setupFilmoScrollSequence(mainSwiper) {
    const FILMO_INDEX = 3; // hero=0, artist=1, media=2, filmo=3

    const filmoSlide = document.querySelector('#filmo');
    if (!filmoSlide) return;

    const brand = filmoSlide.querySelector('.brand_2');
    const filmoInner = filmoSlide.querySelector('.filmo_inner');

    if (!brand || !filmoInner) return;

    // step:
    // 0: 모두 숨김
    // 1: brand_2 main만 보임
    // 2: brand_2 main + sub 보임
    // 3: brand_2 숨김 + filmo_inner 보임
    let step = 0;

    function applyStep() {
        // 클래스 리셋
        brand.classList.remove('step-main', 'step-sub', 'step-hidden');
        filmoInner.classList.remove('filmo-visible');

        if (step === 1) {
            brand.classList.add('step-main');
        } else if (step === 2) {
            brand.classList.add('step-sub');
        } else if (step >= 3) {
            brand.classList.add('step-hidden');
            filmoInner.classList.add('filmo-visible');
        }
        // step 0은 기본값 (brand 투명, filmo_inner 숨김 + pointer-events:none)
    }

    function enterFromTop() {
        // media → filmo 내려올 때
        step = 1;         // main 바로 페이드인
        applyStep();
    }

    function enterFromBottom() {
        // now → filmo 위에서 올라올 때
        // 인트로는 이미 끝난 상태로 보고 바로 contents만 노출
        step = 3;
        applyStep();
    }

    // 슬라이드 이동 방향에 따라 초기 상태 세팅
    mainSwiper.on('slideChangeTransitionStart', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        // 위에서 filmo로 내려올 때 (media → filmo)
        if (curr === FILMO_INDEX && prev < FILMO_INDEX) {
            step = 0;      // 일단 초기화
            applyStep();
        }

        // 아래에서 filmo로 올라올 때 (now → filmo)
        if (curr === FILMO_INDEX && prev > FILMO_INDEX) {
            enterFromBottom();
        }
    });

    mainSwiper.on('slideChangeTransitionEnd', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        // media → filmo 도착 "직후": main 자동 페이드인
        if (curr === FILMO_INDEX && prev < FILMO_INDEX) {
            enterFromTop();
        }
    });

    // 혹시 처음부터 filmo에서 시작하는 경우 대비
    applyStep();

    // ====================== 휠 이벤트로 단계 제어 ======================
    filmoSlide.addEventListener('wheel', (e) => {
        if (mainSwiper.activeIndex !== FILMO_INDEX) return;

        const dy = e.deltaY;

        // 다른 섹션으로 슬라이드 중이면 막기
        if (isVerticalSliding) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // ===== 아래로 스크롤 (다음 단계 / 다음 섹션) =====
        if (dy > 0) {
            // step 1(main) → 2(main+sub) → 3(contents)
            if (step < 3) {
                e.preventDefault();
                e.stopPropagation();
                step += 1;           // 1→2, 2→3
                applyStep();
                return;
            } else {
                // step === 3 : filmo_inner 이미 나와 있음
                // → 여기부터는 Swiper 기본 동작에 맡겨서 다음 섹션(now)로 이동
                // (preventDefault / stopPropagation 안 함)
                return;
            }
        }

// ===== 위로 스크롤 (단계 되감기 / 이전 섹션) =====
if (dy < 0) {
    // contents가 떠있는 상태(step 3)에서 위로 → brand_2 (sub까지) 상태로
    if (step > 1) {
        // 3→2, 2→1
        e.preventDefault();
        e.stopPropagation();
        step -= 1;
        applyStep();
        return;
    }

    // step === 1 (main만 남았을 때)
    // → main을 먼저 페이드아웃시키고, 동시에 이전 섹션으로 슬라이드
    if (step === 1) {
        e.preventDefault();
        e.stopPropagation();

        // 🔹 여기서 main(brand_2) 먼저 사라지게
        step = 0;
        applyStep();   // brand_2 opacity 0으로 전환 (transition으로 페이드아웃)

        // 그리고 곧바로 이전 섹션으로 이동
        isVerticalSliding = true;
        if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
        mainSwiper.slidePrev();
        return;
    }

    // 안전빵: step 0 상태에서 위로 → 바로 이전 섹션
    if (step === 0) {
        e.preventDefault();
        e.stopPropagation();
        isVerticalSliding = true;
        if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
        mainSwiper.slidePrev();
        return;
    }
}


        e.preventDefault();
        e.stopPropagation();
    }, { passive: false });
}

/* ================audition 내부스크롤 ======================= */
function setupAudiScroll(mainSwiper) {
    // hero=0, artist=1, media=2, filmo=3, now=4, audi=5
    const AUDI_INDEX = 5;

    const audiSlide = document.querySelector('#audi');
    if (!audiSlide) return;

    const audiScroll = audiSlide.querySelector('.audi_scroll');
    if (!audiScroll) return;

    audiScroll.addEventListener('wheel', (e) => {
        // 다른 슬라이드에 있을 때는 관여 X
        if (mainSwiper.activeIndex !== AUDI_INDEX) return;

        const dy = e.deltaY;
        const el = e.currentTarget;

        const atTop = el.scrollTop <= 0;
        const atBottom =
            el.scrollHeight - el.clientHeight - el.scrollTop <= 1;

        // 메인 세로 슬라이드 중이면 전부 막기
        if (isVerticalSliding) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // ===================== 아래로 스크롤 =====================
        if (dy > 0) {
            if (!atBottom) {
                // 내부에 아직 스크롤 여유 있으면 → 내부만 스크롤, Swiper로는 안 보냄
                e.stopPropagation();
                return;
            }
            // 맨 아래에서 더 내려도 Swiper로 이벤트 안 넘기고 그냥 막아버림
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // ===================== 위로 스크롤 =====================
        if (dy < 0) {
            if (!atTop) {
                // 내부에서만 위로 올라가게
                e.stopPropagation();
                return;
            }

            // 맨 위에서 위로 한 번 더 → 이전 섹션(#now)로 이동
            e.preventDefault();
            e.stopPropagation();

            isVerticalSliding = true;
            if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
            mainSwiper.slidePrev();
            return;
        }
    }, { passive: false });
}
/* ============================= now swiper ==================================== */
document.addEventListener('DOMContentLoaded', () => {

    const nowSwiper = new Swiper('#now_swiper', {
        autoplay: { delay: 6000 },
        slidesPerView: 6,        
        centeredSlides: true,         
        loop: true,
        speed: 700,
        spaceBetween: 0, 

        navigation: {
            nextEl: '#now .swiper-button-next',
            prevEl: '#now .swiper-button-prev',
        },
    });
});