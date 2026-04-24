<template>
  <div class="page">
    <div class="phone">
      <div class="scroll-area">
        <header class="appbar">
          <div class="bubble bubble-one"></div>
          <div class="bubble bubble-two"></div>
          <div class="brand-row">
            <div class="brand-icon"><Icon name="sparkle" /></div>
            <div>
              <p class="welcome">Welcome back</p>
              <h1>{{ profileName || 'Cleanly Home' }}</h1>
            </div>
          </div>
        </header>

        <main class="content">
          <section v-if="screen === 'allServices'">
            <div class="screen-title-row">
              <button type="button" class="round-button" @click="screen = 'home'">
                <Icon name="back" />
              </button>
              <div>
                <p class="eyebrow">Choose a service</p>
                <h2>All Services</h2>
              </div>
            </div>

            <div class="list">
              <ServiceCard
                v-for="service in services"
                :key="service.name"
                :service="service"
                @select="selectedService = service"
              />
            </div>
          </section>

          <template v-if="screen === 'home' && activeTab === 'services'">
            <section>
              <button type="button" class="hero-card" @click="selectedSlide = slides[activeSlide]">
                <img :src="slides[activeSlide].image" :alt="slides[activeSlide].title" />
                <div class="hero-overlay"></div>
                <div class="hero-text">
                  <h2>{{ slides[activeSlide].title }}</h2>
                  <p>{{ slides[activeSlide].subtitle }}</p>
                </div>
              </button>

              <div class="dots">
                <button
                  v-for="(slide, index) in slides"
                  :key="slide.title"
                  type="button"
                  :class="['dot', activeSlide === index ? 'active' : '']"
                  @click="activeSlide = index"
                ></button>
              </div>
            </section>

            <section>
              <div class="section-header">
                <h2>Our Services</h2>
                <button type="button" class="link-button" @click="screen = 'allServices'">View All</button>
              </div>

              <div class="list">
                <ServiceCard
                  v-for="service in services.slice(0, 3)"
                  :key="service.name"
                  :service="service"
                  @select="selectedService = service"
                />
              </div>
            </section>
          </template>

          <section v-if="screen === 'home' && activeTab === 'bookings'">
            <h2>Recent Bookings</h2>
            <div class="list mt">
              <button
                v-for="booking in recentBookings"
                :key="booking.id"
                type="button"
                class="booking-card"
                @click="selectedBooking = booking"
              >
                <img :src="booking.service.image" :alt="booking.service.name" />
                <div class="booking-content">
                  <div class="booking-top">
                    <h3>{{ booking.service.name }}</h3>
                    <Icon name="chevron" class="muted-icon" />
                  </div>
                  <p>{{ booking.date }}</p>
                  <div class="booking-bottom">
                    <span>{{ booking.status }}</span>
                    <strong>{{ booking.service.price }}</strong>
                  </div>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>

      <nav v-if="screen === 'home'" class="bottom-tabs">
        <button type="button" :class="['tab', activeTab === 'services' ? 'active' : '']" @click="activeTab = 'services'">
          <Icon name="home" />
          <span>Services</span>
        </button>
        <button type="button" :class="['tab', activeTab === 'bookings' ? 'active' : '']" @click="activeTab = 'bookings'">
          <Icon name="booking" />
          <span>Bookings</span>
        </button>
      </nav>

      <SlideDetailSheet v-if="selectedSlide" :slide="selectedSlide" @close="selectedSlide = null" />
      <ServiceDetailSheet v-if="selectedService" :service="selectedService" @close="selectedService = null" />
      <BookingDetailSheet v-if="selectedBooking" :booking="selectedBooking" @close="selectedBooking = null" />
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { callHandler } from 'web-bridge-gateway';

const Icon = defineComponent({
  props: {
    name: { type: String, required: true },
    filled: { type: Boolean, default: false },
  },
  setup(props, { attrs }) {
    const paths = {
      sparkle: ['M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z', 'M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z', 'M5 14l.8 1.7L8 16.5l-2.2.8L5 19l-.8-1.7L2 16.5l2.2-.8L5 14z'],
      clock: ['M12 7v5l3 2'],
      home: ['M3 10.5L12 3l9 7.5', 'M5 10v10h14V10', 'M9 20v-6h6v6'],
      booking: ['M8 3v4', 'M16 3v4', 'M4 10h16', 'M8.5 15l2 2 5-5'],
      star: ['M12 3.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17.4l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.5z'],
      check: ['M8.5 12.5l2.2 2.2 4.8-5.2'],
      shield: ['M12 3l7 3v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3z', 'M9 12l2 2 4-4'],
      chevron: ['M9 18l6-6-6-6'],
      close: ['M18 6L6 18', 'M6 6l12 12'],
      back: ['M15 18l-6-6 6-6'],
      down: ['M6 9l6 6 6-6'],
    };

    return () => {
      const children = [];
      if (props.name === 'clock') children.push(h('circle', { cx: 12, cy: 12, r: 9 }));
      if (props.name === 'booking') children.push(h('rect', { x: 4, y: 5, width: 16, height: 15, rx: 2 }));
      if (props.name === 'check') children.push(h('circle', { cx: 12, cy: 12, r: 9 }));
      children.push(...(paths[props.name] || []).map((d) => h('path', { d })));

      return h('svg', {
        ...attrs,
        viewBox: '0 0 24 24',
        fill: props.filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, children);
    };
  },
});

const slides = [
  {
    title: 'Fresh home, happy life',
    subtitle: 'Book professional cleaners in just a few taps.',
    detail: 'Enjoy a spotless home without spending your weekend cleaning. Our trained team brings the tools, supplies, and care needed to make your space feel fresh again.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Trusted cleaning experts',
    subtitle: 'Reliable teams for apartments, homes, and offices.',
    detail: 'Every cleaner is reviewed for reliability, attention to detail, and professionalism. Choose a schedule that fits your routine and relax while we handle the hard work.',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Same-day service available',
    subtitle: 'Choose your service, date, and payment method.',
    detail: 'Need your home cleaned quickly? Same-day bookings help you prepare for guests, moving day, or a busy week with simple booking and secure payment.',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=1200&q=80',
  },
];

const services = [
  {
    name: 'Basic Home Cleaning',
    duration: '2 hours',
    price: '$25.00',
    rating: '4.8',
    reviews: '128 reviews',
    description: 'Perfect for regular maintenance to keep your home fresh, clean, and comfortable after a busy week.',
    included: ['Dusting all surfaces', 'Vacuuming & mopping floors', 'Kitchen surface cleaning', 'Bathroom cleaning', 'Empty trash'],
    image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Deep Cleaning',
    duration: '4 hours',
    price: '$55.00',
    rating: '4.9',
    reviews: '96 reviews',
    description: 'A detailed top-to-bottom cleaning service for kitchens, bathrooms, living areas, and hard-to-reach corners.',
    included: ['Deep bathroom sanitizing', 'Kitchen appliance exterior', 'Cabinet surface wipe-down', 'Floor scrubbing', 'Detailed dust removal'],
    image: 'https://images.unsplash.com/photo-1603712725038-e9334ae8f39f?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Move-in Cleaning',
    duration: '5 hours',
    price: '$70.00',
    rating: '4.7',
    reviews: '74 reviews',
    description: 'Prepare your new home before moving in with a thorough cleaning for empty rooms, surfaces, and floors.',
    included: ['Empty-room cleaning', 'Inside cabinet wipe', 'Bathroom sanitizing', 'Kitchen cleaning', 'Floor vacuum & mop'],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Sofa & Carpet Care',
    duration: '3 hours',
    price: '$40.00',
    rating: '4.8',
    reviews: '82 reviews',
    description: 'Refresh sofas, rugs, and carpets with careful stain treatment and fabric-safe cleaning methods.',
    included: ['Fabric inspection', 'Vacuum treatment', 'Spot cleaning', 'Odor refresh', 'Light drying support'],
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=500&q=80',
  },
];

const recentBookings = [
  { id: 'BK-24018', service: services[0], status: 'Completed', date: 'Today, 10:30 AM', address: 'House 12, Street 310, Phnom Penh', cleaner: 'Sophea Team', payment: 'Paid with ABA PAY' },
  { id: 'BK-24012', service: services[1], status: 'Completed', date: 'Yesterday, 2:00 PM', address: 'Condo B-18, Riverside Residence', cleaner: 'Dara Team', payment: 'Paid with ABA PAY' },
  { id: 'BK-24005', service: services[3], status: 'Completed', date: '12 Jan, 9:00 AM', address: 'Office 5F, Norodom Blvd', cleaner: 'Nita Team', payment: 'Paid with ABA PAY' },
];

const profileName = ref('');
const screen = ref('home');
const activeSlide = ref(0);
const activeTab = ref('services');
const selectedSlide = ref(null);
const selectedService = ref(null);
const selectedBooking = ref(null);

onMounted(async () => {
  try {
    const data = await callHandler('getProfile', {});
    const firstName = data?.firstName || data?.payload?.firstName;
    if (firstName) profileName.value = firstName;
  } catch (error) {
    console.warn('getProfile handler failed:', error);
  }
});

const ServiceCard = defineComponent({
  props: { service: { type: Object, required: true } },
  emits: ['select'],
  setup(props, { emit }) {
    return () => h('button', { type: 'button', onClick: () => emit('select'), class: 'service-card' }, [
      h('img', { src: props.service.image, alt: props.service.name }),
      h('div', { class: 'service-info' }, [
        h('div', { class: 'service-top' }, [h('h3', props.service.name), h('strong', props.service.price)]),
        h('div', { class: 'meta' }, [
          h('span', [h(Icon, { name: 'clock' }), ` ${props.service.duration}`]),
          h('span', [h(Icon, { name: 'star', filled: true }), ` ${props.service.rating}`]),
        ]),
        h('div', { class: 'service-action' }, [h('span', 'View detail'), h(Icon, { name: 'chevron' })]),
      ]),
    ]);
  },
});

const PaymentBar = defineComponent({
  props: { amount: { type: String, required: true } },
  setup(props) {
    const numericAmount = computed(() => props.amount.replace('$', ''));
    return () => h('div', { class: 'payment-bar' }, [
      h('div', { class: 'account-row' }, [
        h('div', [h('h3', 'Savings Account'), h('p', '000 123 569 | USD')]),
        h('button', ['Accounts ', h(Icon, { name: 'down' })]),
      ]),
      h('button', { class: 'pay-button' }, [
        h('span', { class: 'aba-logo' }, [h('span', 'ABA'), h('br'), h('span', 'PAY')]),
        h('span', { class: 'pay-divider' }),
        h('span', `Pay ${numericAmount.value} USD`),
      ]),
    ]);
  },
});

const ServiceDetailSheet = defineComponent({
  props: { service: { type: Object, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    return () => h('div', { class: 'sheet-layer' }, [
      h('button', { type: 'button', class: 'scrim', onClick: () => emit('close') }),
      h('div', { class: 'sheet service-sheet' }, [
        h('div', { class: 'sheet-header' }, [
          h('div', { class: 'handle' }),
          h('button', { type: 'button', class: 'close-button', onClick: () => emit('close') }, [h(Icon, { name: 'close' })]),
          h('div', { class: 'service-detail-head' }, [
            h('img', { src: props.service.image, alt: props.service.name }),
            h('div', [
              h('h2', props.service.name),
              h('p', { class: 'rating' }, [h(Icon, { name: 'star', filled: true }), ` ${props.service.rating} (${props.service.reviews})`]),
              h('p', { class: 'duration-pill' }, [h(Icon, { name: 'clock' }), ` ${props.service.duration}`]),
            ]),
          ]),
        ]),
        h('div', { class: 'sheet-body' }, [
          h('section', [h('h3', 'About this service'), h('p', props.service.description)]),
          h('section', [
            h('h3', "What's included"),
            h('div', { class: 'included-list' }, props.service.included.map((item) => h('div', { key: item }, [h(Icon, { name: 'check' }), h('span', item)]))),
          ]),
          h('div', { class: 'guarantee' }, [h(Icon, { name: 'shield' }), h('div', [h('h3', '100% Satisfaction Guarantee'), h('p', "If you're not happy, we'll come back and re-clean for free.")])]),
        ]),
        h(PaymentBar, { amount: props.service.price }),
      ]),
    ]);
  },
});

const SlideDetailSheet = defineComponent({
  props: { slide: { type: Object, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    return () => h('div', { class: 'sheet-layer slide-layer' }, [
      h('button', { type: 'button', class: 'scrim', onClick: () => emit('close') }),
      h('div', { class: 'sheet simple-sheet' }, [
        h('div', { class: 'handle' }),
        h('button', { type: 'button', class: 'close-button', onClick: () => emit('close') }, [h(Icon, { name: 'close' })]),
        h('img', { src: props.slide.image, alt: props.slide.title, class: 'sheet-image' }),
        h('p', { class: 'eyebrow' }, 'Promotion'),
        h('h2', props.slide.title),
        h('p', { class: 'subtitle' }, props.slide.subtitle),
        h('p', { class: 'detail-text' }, props.slide.detail),
        h('button', { class: 'primary-button', onClick: () => emit('close') }, 'Got it'),
      ]),
    ]);
  },
});

const BookingDetailSheet = defineComponent({
  props: { booking: { type: Object, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    return () => h('div', { class: 'sheet-layer booking-layer' }, [
      h('button', { type: 'button', class: 'scrim', onClick: () => emit('close') }),
      h('div', { class: 'sheet simple-sheet' }, [
        h('div', { class: 'handle' }),
        h('button', { type: 'button', class: 'close-button', onClick: () => emit('close') }, [h(Icon, { name: 'close' })]),
        h('div', { class: 'booking-detail-head' }, [
          h('img', { src: props.booking.service.image, alt: props.booking.service.name }),
          h('div', [h('p', { class: 'status-text' }, props.booking.status), h('h2', props.booking.service.name), h('p', `Booking ID: ${props.booking.id}`)]),
        ]),
        h('div', { class: 'detail-grid' }, [
          h('div', [h('span', 'Schedule'), h('strong', props.booking.date), h('p', `Duration: ${props.booking.service.duration}`)]),
          h('div', [h('span', 'Address'), h('p', props.booking.address)]),
          h('div', [h('span', 'Cleaner'), h('strong', props.booking.cleaner)]),
          h('div', [h('span', 'Total'), h('strong', props.booking.service.price)]),
        ]),
        h('div', { class: 'payment-success' }, [h(Icon, { name: 'check' }), h('div', [h('strong', 'Payment successful'), h('p', props.booking.payment)])]),
      ]),
    ]);
  },
});
</script>

<style>
* { box-sizing: border-box; }
img { display: block; max-width: 100%; }
button { font: inherit; }
svg { width: 1.25rem; height: 1.25rem; }
.page { min-height: 100vh; background: #f1f5f9; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0f172a; }
.phone { width: 100%; max-width: 390px; height: 820px; background: white; border-radius: 40px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px rgba(15, 23, 42, 0.22); position: relative; }
.scroll-area { height: 100%; overflow-y: auto; padding-bottom: 96px; background: #f8fafc; }
.appbar { position: relative; overflow: hidden; background: linear-gradient(135deg, #06b6d4, #0ea5e9, #2563eb); padding: 48px 24px 28px; color: white; border-bottom-left-radius: 32px; border-bottom-right-radius: 32px; }
.bubble { position: absolute; border-radius: 999px; background: rgba(255,255,255,.15); }
.bubble-one { right: -40px; top: -40px; width: 144px; height: 144px; }
.bubble-two { right: 64px; bottom: 16px; width: 64px; height: 64px; background: rgba(255,255,255,.1); }
.brand-row { position: relative; display: flex; gap: 12px; align-items: center; }
.brand-icon { width: 48px; height: 48px; border-radius: 18px; background: rgba(255,255,255,.2); display: grid; place-items: center; box-shadow: 0 10px 20px rgba(15, 23, 42, .15); }
.welcome { margin: 0; font-size: 14px; color: rgba(255,255,255,.78); }
h1, h2, h3, p { margin: 0; }
h1 { font-size: 24px; line-height: 1.2; }
h2 { font-size: 20px; }
.content { padding: 20px; display: flex; flex-direction: column; gap: 24px; }
.hero-card { position: relative; width: 100%; height: 176px; border: 0; padding: 0; overflow: hidden; border-radius: 32px; box-shadow: 0 12px 24px rgba(15, 23, 42, .18); background: #e2e8f0; text-align: left; }
.hero-card img { width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(2,6,23,.75), rgba(15,23,42,.25), transparent); }
.hero-text { position: absolute; left: 20px; right: 20px; bottom: 20px; color: white; }
.hero-text p { margin-top: 4px; max-width: 230px; font-size: 14px; color: rgba(255,255,255,.86); }
.dots { display: flex; justify-content: center; gap: 8px; margin-top: 12px; }
.dot { width: 8px; height: 8px; border-radius: 999px; border: 0; background: #cbd5e1; padding: 0; }
.dot.active { width: 28px; background: #0ea5e9; }
.section-header, .screen-title-row { display: flex; align-items: center; justify-content: space-between; }
.screen-title-row { justify-content: flex-start; gap: 12px; margin-bottom: 16px; }
.eyebrow { font-size: 14px; font-weight: 700; color: #0284c7; margin-bottom: 2px; }
.link-button { border: 0; background: transparent; color: #0284c7; font-weight: 800; padding: 6px; }
.round-button { width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 999px; background: white; color: #0284c7; box-shadow: 0 4px 12px rgba(15, 23, 42, .08); }
.list { display: flex; flex-direction: column; gap: 12px; }
.mt { margin-top: 16px; }
.service-card { width: 100%; display: flex; gap: 12px; border: 0; border-radius: 24px; background: white; padding: 12px; text-align: left; box-shadow: 0 4px 12px rgba(15, 23, 42, .06); }
.service-card > img { width: 80px; height: 80px; border-radius: 18px; object-fit: cover; flex-shrink: 0; }
.service-info { flex: 1; min-width: 0; }
.service-top { display: flex; justify-content: space-between; gap: 8px; }
.service-top h3 { font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.service-top strong { color: #0284c7; white-space: nowrap; }
.meta { margin-top: 8px; display: flex; gap: 12px; color: #64748b; font-size: 14px; }
.meta span { display: flex; align-items: center; gap: 4px; }
.meta svg { width: 16px; height: 16px; }
.service-action { margin-top: 10px; display: flex; justify-content: space-between; align-items: center; }
.service-action span { background: #f0f9ff; color: #0369a1; border-radius: 999px; padding: 6px 14px; font-size: 14px; font-weight: 700; }
.service-action svg { color: #cbd5e1; }
.booking-card { width: 100%; display: flex; gap: 12px; border: 0; border-radius: 24px; background: white; padding: 16px; text-align: left; box-shadow: 0 4px 12px rgba(15, 23, 42, .06); }
.booking-card img { width: 64px; height: 64px; border-radius: 18px; object-fit: cover; }
.booking-content { flex: 1; min-width: 0; }
.booking-top, .booking-bottom { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.booking-top h3 { font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.booking-content p { margin-top: 4px; color: #64748b; font-size: 14px; }
.booking-bottom { margin-top: 8px; }
.booking-bottom span { border-radius: 999px; background: #ecfdf5; color: #059669; padding: 4px 12px; font-size: 12px; font-weight: 800; }
.muted-icon { color: #cbd5e1; }
.bottom-tabs { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; padding: 14px 64px; background: rgba(255,255,255,.96); border-top: 1px solid #f1f5f9; backdrop-filter: blur(12px); }
.tab { border: 0; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #94a3b8; font-weight: 800; font-size: 14px; }
.tab.active { color: #0284c7; }
.sheet-layer { position: absolute; inset: 0; z-index: 40; display: flex; align-items: flex-end; }
.slide-layer { z-index: 30; }
.booking-layer { z-index: 50; }
.scrim { position: absolute; inset: 0; border: 0; background: rgba(2, 6, 23, .45); }
.sheet { position: relative; width: 100%; background: white; border-top-left-radius: 32px; border-top-right-radius: 32px; box-shadow: 0 -16px 36px rgba(15, 23, 42, .2); }
.simple-sheet { padding: 20px; }
.service-sheet { max-height: 92%; display: flex; flex-direction: column; }
.handle { width: 48px; height: 6px; border-radius: 999px; background: #e2e8f0; margin: 0 auto 16px; }
.close-button { position: absolute; right: 20px; top: 20px; width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 999px; background: #f8fafc; color: #64748b; }
.sheet-image { width: 100%; height: 176px; border-radius: 24px; object-fit: cover; background: #e2e8f0; }
.subtitle { margin-top: 8px; font-size: 14px; font-weight: 600; color: #64748b; }
.detail-text { margin-top: 14px; font-size: 14px; line-height: 1.65; color: #475569; }
.primary-button { margin-top: 24px; width: 100%; border: 0; border-radius: 18px; background: #0284c7; color: white; padding: 14px; font-weight: 800; box-shadow: 0 10px 24px rgba(14, 165, 233, .25); }
.sheet-header { padding: 20px 20px 0; }
.service-detail-head { display: flex; gap: 16px; padding-right: 40px; }
.service-detail-head img { width: 112px; height: 112px; border-radius: 24px; object-fit: cover; background: #e2e8f0; }
.rating { margin-top: 12px; color: #059669; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 4px; }
.duration-pill { margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; background: #f1f5f9; color: #64748b; font-size: 14px; font-weight: 700; padding: 8px 12px; }
.sheet-body { flex: 1; overflow-y: auto; padding: 20px; }
.sheet-body section { border-top: 1px solid #f1f5f9; padding-top: 18px; margin-bottom: 22px; }
.sheet-body section p { margin-top: 10px; color: #475569; font-size: 14px; line-height: 1.65; }
.included-list { margin-top: 14px; display: flex; flex-direction: column; gap: 14px; }
.included-list div { display: flex; gap: 12px; align-items: center; color: #475569; font-size: 14px; }
.included-list svg { color: #059669; flex-shrink: 0; }
.guarantee { display: flex; gap: 12px; border-radius: 24px; background: #ecfdf5; color: #065f46; padding: 16px; }
.guarantee > svg { color: #059669; width: 32px; height: 32px; flex-shrink: 0; }
.guarantee p { margin-top: 4px; color: #047857; font-size: 14px; line-height: 1.45; }
.payment-bar { flex-shrink: 0; border-top: 1px solid #f1f5f9; border-top-left-radius: 28px; border-top-right-radius: 28px; background: white; padding: 16px; box-shadow: 0 -8px 28px rgba(15, 23, 42, .1); }
.account-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.account-row h3 { font-size: 16px; }
.account-row p { margin-top: 4px; color: #94a3b8; font-size: 14px; font-weight: 600; }
.account-row button { border: 0; background: transparent; color: #64748b; display: flex; align-items: center; gap: 4px; font-weight: 800; }
.account-row svg { color: #059669; width: 16px; height: 16px; }
.pay-button { width: 100%; height: 56px; border: 0; border-radius: 18px; background: #059669; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 10px 24px rgba(16, 185, 129, .2); }
.aba-logo { margin-right: 16px; border-radius: 6px; background: white; color: #059669; padding: 4px 8px; font-size: 10px; font-weight: 900; line-height: 1; }
.pay-divider { width: 1px; height: 28px; background: rgba(255,255,255,.35); margin-right: 16px; }
.booking-detail-head { display: flex; gap: 16px; padding-right: 40px; }
.booking-detail-head img { width: 96px; height: 96px; border-radius: 24px; object-fit: cover; }
.status-text { color: #059669; font-weight: 800; font-size: 14px; margin-bottom: 4px; }
.booking-detail-head p:last-child { margin-top: 8px; color: #64748b; font-size: 14px; font-weight: 600; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
.detail-grid > div { border-radius: 22px; background: #f8fafc; padding: 14px; }
.detail-grid span { display: block; color: #94a3b8; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: .04em; margin-bottom: 6px; }
.detail-grid strong { display: block; }
.detail-grid p { color: #475569; font-size: 13px; line-height: 1.45; }
.payment-success { margin-top: 14px; display: flex; gap: 12px; align-items: center; border-radius: 22px; background: #ecfdf5; color: #047857; padding: 14px; }
.payment-success p { font-size: 14px; margin-top: 2px; }
@media (max-width: 430px) { .page { padding: 0; } .phone { height: 100vh; max-width: none; border-radius: 0; border: 0; } }
</style>
