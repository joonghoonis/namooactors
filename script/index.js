let isVerticalSliding = false;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper === 'undefined') {
        console.error('Swiper library is not loaded. Please include Swiper JS first.');
        return;
    }

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
    const artistImageCards = document.querySelectorAll(
        '#artistSwiper .artist_card:not(.artist_more)'
    );
    const totalImageCards = artistImageCards.length;
    const moreCard = document.querySelector('#artistSwiper .artist_more');
    const ARTIST_INDEX = 1; // hero = 0, artist = 1

    function getVisibleCountByProgress(progress) {
        if (progress <= 0) return 0;

        const t2 = 0.08;
        const t3 = 0.20;
        const t4 = 0.40;
        const t5 = 0.62;
        const t6 = 0.80;

        let count = 1;

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

        artistImageCards.forEach((card, idx) => {
            if (idx < visibleCount) card.classList.add('is-visible');
            else card.classList.remove('is-visible');
        });

        if (moreCard) {
            const moreThreshold = 0.7;
            if (progress >= moreThreshold) moreCard.classList.add('is-visible');
            else moreCard.classList.remove('is-visible');
        }
    }

    // 초기 상태
    artistSwiper.updateProgress();
    updateArtistCardsByProgress();

    mainSwiper.on('slideChangeTransitionEnd', () => {
        if (mainSwiper.activeIndex === ARTIST_INDEX && artistImageCards[0]) {
            artistImageCards[0].classList.add('is-visible');
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

                updateArtistCardsByProgress();

                // 아래 방향 → 다음 섹션
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

                // 위 방향 → 이전 섹션
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

    // =============== media ===============
    setupMediaCategory();
    setupMediaScrollSequence(mainSwiper);

    // =============== filmography (years list + contents) ===============
    initYearsSwiperAndFilmography();

    // =============== filmo intro sequence ===============
    setupFilmoScrollSequence(mainSwiper);

    // =============== audition 내부 스크롤 ===============
    setupAudiScroll(mainSwiper);

    // =============== now swiper ===============
    initNowSwiper();

    // =============== scene(영상 플레이리스트) ===============
    initSceneSection();

    // =============== posters cube swiper ===============
    initPosterSwiper();

    // =============== photo coverflow swiper ===============
    initPhotoSwiper();
});

// ================= 미디어 카테고리 탭 =================
function setupMediaCategory() {
    const mediaCategoryItems = document.querySelectorAll('#media .category li');
    const mediaPanels = document.querySelectorAll('#media .media_contents > div');

    if (!mediaCategoryItems.length || !mediaPanels.length) return;

    let activeIndex = 0;

    function updateMediaCategory(index) {
        activeIndex = index;

        mediaCategoryItems.forEach((li, idx) => {
            li.classList.remove('depth-0', 'depth-1', 'depth-2', 'depth-3');

            const diff = Math.abs(idx - activeIndex);
            const depth = Math.min(diff, 3);

            li.classList.add(`depth-${depth}`);
        });

        mediaPanels.forEach((panel, idx) => {
            panel.classList.toggle('is-active', idx === activeIndex);
        });
    }

    updateMediaCategory(activeIndex);

    mediaCategoryItems.forEach((li, idx) => {
        const btn = li.querySelector('button');
        if (!btn) return;

        btn.addEventListener('click', () => {
            updateMediaCategory(idx);
        });
    });
}

// ================= 미디어 스크롤 시퀀스 =================
function setupMediaScrollSequence(mainSwiper) {
    const MEDIA_INDEX = 2;

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
    let sequenceCompleted = false;

    function clearTextClasses() {
        [...text1Els, ...text2Els, ...text3Els].forEach(el => {
            el.classList.remove('text-show', 'text-hide');
        });
        mediaInner.classList.remove('media-visible');
    }

    function addClassToAll(list, className) {
        list.forEach(el => el.classList.add(className));
    }

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
    }

    function resetStateToIntro() {
        step = 0;
        sequenceCompleted = false;
        clearTextClasses();
        mediaScroll.scrollTop = 0;
        applyStep();
    }

    function setStateToCompletedFromBottom() {
        step = 4;
        sequenceCompleted = true;

        clearTextClasses();
        addClassToAll(text1Els, 'text-hide');
        addClassToAll(text2Els, 'text-hide');
        addClassToAll(text3Els, 'text-hide');
        mediaInner.classList.add('media-visible');

        mediaScroll.scrollTop = mediaScroll.scrollHeight;
    }

    mainSwiper.on('slideChangeTransitionStart', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        if (curr === MEDIA_INDEX && prev < MEDIA_INDEX) {
            resetStateToIntro();
        }

        if (curr === MEDIA_INDEX && prev > MEDIA_INDEX) {
            setStateToCompletedFromBottom();
        }
    });

    mainSwiper.on('slideChangeTransitionEnd', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        if (curr === MEDIA_INDEX && prev < MEDIA_INDEX) {
            step = 1;
            sequenceCompleted = false;
            applyStep();
        }
    });

    applyStep();

    mediaScroll.addEventListener('wheel', (e) => {
        const dy = e.deltaY;

        if (mainSwiper.activeIndex !== MEDIA_INDEX) return;

        const el = e.currentTarget;
        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;

        if (isVerticalSliding) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // 1) 인트로(0~3)
        if (step < 4) {
            e.preventDefault();
            e.stopPropagation();

            if (dy > 0) {
                if (step < 4) {
                    step++;
                    applyStep();
                    if (step === 4) sequenceCompleted = true;
                }
            } else if (dy < 0) {
                if (step > 1) {
                    step -= 1;
                    applyStep();
                    return;
                }

                // step === 1 → text1 hide + artist로
                if (step === 1) {
                    step = 0;
                    sequenceCompleted = false;
                    applyStep();

                    isVerticalSliding = true;
                    if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
                    mainSwiper.slidePrev();
                    return;
                }

                // step === 0 → 바로 artist로
                if (step === 0) {
                    isVerticalSliding = true;
                    if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
                    mainSwiper.slidePrev();
                    return;
                }
            }
            return;
        }

        // 2) 실제 스크롤 + 역재생 (step >= 4)
        if (step >= 4 && sequenceCompleted) {
            if (atTop && dy < 0) {
                // mediaInner → 텍스트 역재생 진입
                e.preventDefault();
                e.stopPropagation();

                step = 3;
                sequenceCompleted = false;
                applyStep();
                return;
            }

            if (atBottom && dy > 0) {
                // 다음 섹션은 Swiper mousewheel에 맡김
                return;
            }

            // 중간 구간은 내부 스크롤만
            e.stopPropagation();
            return;
        }

        e.stopPropagation();
    }, { passive: false });
}

// ================= filmography : 연도 → 콘텐츠 매핑 =================
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

function initYearsSwiperAndFilmography() {
    const yearsContainer = document.querySelector('.years_list.swiper');
    if (!yearsContainer) return;

    const yearsSwiper = new Swiper('.years_list.swiper', {
        direction: 'vertical',
        slidesPerView: 'auto',
        centeredSlides: true,
        spaceBetween: 7,
        touchRatio: 0,
        grabCursor: false,
        speed: 300,
        resistanceRatio: 0,
        setWrapperSize: true,
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

    yearsSwiper.on('setTranslate', function () {
        const swiper = this;

        for (let i = 0; i < swiper.slides.length; i++) {
            const slide = swiper.slides[i];
            const slideButton = slide.querySelector('button');
            let absProgress = Math.abs(swiper.slides[i].progress);
            let opacity;

            if (absProgress < 1) {
                opacity = 1.0 - (absProgress * 0.4);
            } else if (absProgress < 2) {
                let fractionalProgress = absProgress - 1;
                opacity = 0.6 - (fractionalProgress * 0.2);
            } else if (absProgress < 3) {
                let fractionalProgress = absProgress - 2;
                opacity = 0.4 - (fractionalProgress * 0.2);
            } else {
                opacity = 0.2;
            }

            if (slideButton) {
                slideButton.style.opacity = opacity;
                if (!slide.classList.contains('swiper-slide-active')) {
                    slideButton.style.color = `rgba(255, 255, 255, ${opacity * 0.9 + 0.1})`;
                }
            }
        }
    });

    yearsSwiper.on('slideChangeTransitionEnd', function () {
        const activeSlide = yearsSwiper.slides[yearsSwiper.activeIndex];
        const button = activeSlide.querySelector('button');
        if (button) {
            const currentYear = button.dataset.year;
            updateFilmography(currentYear);
        }
    });

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
            }
        });
    });

    yearsContainer.addEventListener('wheel', (event) => {
        event.stopPropagation();
    }, { passive: false });

    const initialButton = yearsSwiper.slides[yearsSwiper.activeIndex].querySelector('button');
    if (initialButton) {
        updateFilmography(initialButton.dataset.year);
    }

    yearsSwiper.emit('setTranslate');
}

// ================= filmography : intro → contents 스크롤 시퀀스 =================
function setupFilmoScrollSequence(mainSwiper) {
    const FILMO_INDEX = 3;

    const filmoSlide = document.querySelector('#filmo');
    if (!filmoSlide) return;

    const brand = filmoSlide.querySelector('.brand_2');
    const filmoInner = filmoSlide.querySelector('.filmo_inner');

    if (!brand || !filmoInner) return;

    let step = 0;

    function applyStep() {
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
    }

    function enterFromTop() {
        step = 1;
        applyStep();
    }

    function enterFromBottom() {
        step = 3;
        applyStep();
    }

    mainSwiper.on('slideChangeTransitionStart', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        if (curr === FILMO_INDEX && prev < FILMO_INDEX) {
            step = 0;
            applyStep();
        }

        if (curr === FILMO_INDEX && prev > FILMO_INDEX) {
            enterFromBottom();
        }
    });

    mainSwiper.on('slideChangeTransitionEnd', (swiper) => {
        const prev = swiper.previousIndex;
        const curr = swiper.activeIndex;

        if (curr === FILMO_INDEX && prev < FILMO_INDEX) {
            enterFromTop();
        }
    });

    applyStep();

    filmoSlide.addEventListener('wheel', (e) => {
        if (mainSwiper.activeIndex !== FILMO_INDEX) return;

        const dy = e.deltaY;

        if (isVerticalSliding) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (dy > 0) {
            if (step < 3) {
                e.preventDefault();
                e.stopPropagation();
                step += 1;
                applyStep();
                return;
            } else {
                // step === 3 → Swiper 기본 동작
                return;
            }
        }

        if (dy < 0) {
            if (step > 1) {
                e.preventDefault();
                e.stopPropagation();
                step -= 1;
                applyStep();
                return;
            }

            if (step === 1) {
                e.preventDefault();
                e.stopPropagation();

                step = 0;
                applyStep();

                isVerticalSliding = true;
                if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
                mainSwiper.slidePrev();
                return;
            }

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

// ================= audition 내부 스크롤 =================
function setupAudiScroll(mainSwiper) {
    const AUDI_INDEX = 5;

    const audiSlide = document.querySelector('#audi');
    if (!audiSlide) return;

    const audiScroll = audiSlide.querySelector('.audi_scroll');
    if (!audiScroll) return;

    audiScroll.addEventListener('wheel', (e) => {
        if (mainSwiper.activeIndex !== AUDI_INDEX) return;

        const dy = e.deltaY;
        const el = e.currentTarget;

        const atTop = el.scrollTop <= 0;
        const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;

        if (isVerticalSliding) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (dy > 0) {
            if (!atBottom) {
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (dy < 0) {
            if (!atTop) {
                e.stopPropagation();
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            isVerticalSliding = true;
            if (mainSwiper.mousewheel) mainSwiper.mousewheel.disable();
            mainSwiper.slidePrev();
            return;
        }
    }, { passive: false });
}

// ================= now swiper =================
function initNowSwiper() {
    const el = document.querySelector('#now_swiper');
    if (!el || typeof Swiper === 'undefined') return;

    new Swiper('#now_swiper', {
        autoplay: { delay: 6000 },
        slidesPerView: 6.5,
        centeredSlides: true,
        loop: true,
        speed: 700,
        spaceBetween: 30,
        navigation: {
            nextEl: '#now .swiper-button-next',
            prevEl: '#now .swiper-button-prev',
        },
    });
}

// ================= scene (영상) =================
function initSceneSection() {
    const scene = document.querySelector('.scene');
    if (!scene) return;

    const mainPlayer = scene.querySelector('.scene_main_player');
    if (!mainPlayer) return;

    const iframe = mainPlayer.querySelector('iframe');
    const mainThumbOverlay = mainPlayer.querySelector('.scene_main_thumb');
    const mainPlayBtn = mainThumbOverlay ? mainThumbOverlay.querySelector('.scene_main_play') : null;
    const mainTitleEl = mainPlayer.querySelector('.scene_main_title');
    const mainThumbImg = mainThumbOverlay ? mainThumbOverlay.querySelector('img') : null;

    if (!iframe || !mainThumbOverlay) return;

    const FADE_DURATION = 300;

    if (!mainPlayer.dataset.videoSrc) {
        mainPlayer.dataset.videoSrc = iframe.src;
    }

    function buildAutoplaySrc(baseSrc) {
        if (!baseSrc) return '';
        let url = baseSrc;
        if (!url.includes('autoplay=1')) {
            url += (url.includes('?') ? '&' : '?') + 'autoplay=1';
        }
        return url;
    }

    function hideOverlay() {
        mainThumbOverlay.classList.add('is-hidden');
    }

    function showOverlay() {
        mainThumbOverlay.classList.remove('is-hidden');
    }

    function playCurrentMain() {
        const baseSrc = mainPlayer.dataset.videoSrc || iframe.src;
        iframe.src = buildAutoplaySrc(baseSrc);
        hideOverlay();
    }

    if (mainPlayBtn) {
        mainPlayBtn.addEventListener('click', playCurrentMain);
    }
    mainThumbOverlay.addEventListener('click', playCurrentMain);

    const playlistSwiperEl = scene.querySelector('#scenePlaylistSwiper');
    if (window.Swiper && playlistSwiperEl) {
        new Swiper('#scenePlaylistSwiper', {
            direction: 'vertical',
            slidesPerView: 'auto',
            freeMode: true,
            spaceBetween: 10,
            mousewheel: {
                enabled: true,
                releaseOnEdges: true
            },
            nested: true
        });

        playlistSwiperEl.addEventListener('wheel', function (e) {
            e.stopPropagation();
        }, { passive: false });
    }

    const thumbSlides = scene.querySelectorAll('#scenePlaylistSwiper .scene_thumb');

    thumbSlides.forEach(function (slide) {
        const button = slide.querySelector('.scene_thumb_btn');
        if (!button) return;

        button.addEventListener('click', function () {
            const clickedId = slide.dataset.videoId;
            const clickedSrc = slide.dataset.videoSrc;
            if (!clickedSrc) return;

            const slideImg = slide.querySelector('.scene_thumb_image img');
            const slideTitleEl = slide.querySelector('.scene_thumb_title');

            const newTitle = slideTitleEl ? slideTitleEl.textContent.trim() : '';
            const newThumb = slideImg ? slideImg.src : '';

            if (mainPlayer.classList.contains('is-fading')) return;

            mainPlayer.classList.add('is-fading');

            setTimeout(function () {
                if (clickedId) mainPlayer.dataset.videoId = clickedId;
                mainPlayer.dataset.videoSrc = clickedSrc;

                if (mainTitleEl && newTitle) {
                    mainTitleEl.textContent = newTitle;
                }
                if (mainThumbImg && newThumb) {
                    mainThumbImg.src = newThumb;
                }

                iframe.src = clickedSrc;
                showOverlay();

                thumbSlides.forEach(function (s) {
                    s.classList.remove('is-active');
                });
                slide.classList.add('is-active');

                mainPlayer.classList.remove('is-fading');
            }, FADE_DURATION);
        });
    });

    const initialId = mainPlayer.dataset.videoId;
    if (initialId) {
        thumbSlides.forEach(function (slide) {
            if (slide.dataset.videoId === initialId) {
                slide.classList.add('is-active');
            }
        });
    }
}

// ================= posters cube swiper =================
function initPosterSwiper() {
    const el = document.querySelector('#posters');
    if (!el || typeof Swiper === 'undefined') return;

    new Swiper('#posters', {
        effect: 'cube',
        grabCursor: true,
        autoplay: {
            delay: 1800
        },
        loop: true,
        speed: 1200,
        cubeEffect: {
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
        },
        pagination: {
            el: '#posters .swiper-pagination',
        },
    });
}

// ================= photo coverflow swiper =================
function initPhotoSwiper() {
    const el = document.querySelector('.photo .swiper');
    if (!el || typeof Swiper === 'undefined') return;

    new Swiper('.photo .swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        navigation: {
            nextEl: '.photo_inner .swiper_btn .swiper-button-next',
            prevEl: '.photo_inner .swiper_btn .swiper-button-prev'
        }
    });
}
