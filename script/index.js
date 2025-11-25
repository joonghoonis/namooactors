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
        const t2 = 0.10; // 2번
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
                // 위로 → 3→2→1→0
                if (step > 0) {
                    step--;
                    applyStep();
                    if (step === 0) {
                        sequenceCompleted = false;
                    }
                } else {
                    // step 0에서 위로 → 이전 섹션으로 (artist)
                    isVerticalSliding = true;
                    if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
                    mainSwiper.slidePrev();
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
