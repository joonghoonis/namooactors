document.addEventListener('DOMContentLoaded', () => {
    let isVerticalSliding = false;

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
        const t4 = 0.38; // 4번
        const t5 = 0.56; // 5번
        const t6 = 0.76; // 6번

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
});

const mediaScroll = document.querySelector('#media .media_scroll');

if (mediaScroll) {
    mediaScroll.addEventListener('wheel', (e) => {
        const dy = e.deltaY;
        const el = e.currentTarget;

        const atTop = el.scrollTop === 0;
        const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;

        // 위로 스크롤 + 아직 맨 위 아님 → 내부 스크롤만
        if (dy < 0 && !atTop) {
            e.stopPropagation();
            return;
        }

        // 아래로 스크롤 + 아직 맨 아래 아님 → 내부 스크롤만
        if (dy > 0 && !atBottom) {
            e.stopPropagation();
            return;
        }

        // top / bottom 도달했을 때만 Swiper로 휠 전달
        // (여기서는 굳이 preventDefault 안 걸고 Swiper에 맡김)
    }, { passive: false });
}
