import http from 'http';

const payload = {
  sectionIdentifier: 'client-testimonials',
  componentType: 'TESTIMONIAL_SLIDER',
  displayOrder: 6,
  isActive: true,
  contentPayload: {
    eyebrow: 'CLIENT LOVE',
    title: 'Hear it from the founders.',
    titleHighlight: 'founders.',
    description: 'Real experiences from businesses we have helped build, scale, and transform.',
    ratingSummary: {
      enabled: true,
      ratingValue: 4.9,
      maxRating: 5.0,
      reviewCountText: 'On camera, not a screenshot',
      badgeText: 'Verified Client Reviews',
    },
    videoTestimonials: [
      {
        id: 'video-1',
        name: 'Sarah Jenkins',
        role: 'CEO & Founder',
        company: 'Meridian Health',
        quote: 'Working with Gypsym completely reshaped our patient conversion pipeline and boosted signups by 140%.',
        thumbnailUrl: '/images/testimonials/founder-1.jpg',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
        durationText: '1:45',
        metricHighlight: '+140% patient signups',
      },
      {
        id: 'video-2',
        name: 'Marcus Vance',
        role: 'Chief Technology Officer',
        company: 'Aether Logistics',
        quote: 'They eliminated our legacy tech bottlenecks in weeks. Delivery was on time, transparent, and seamless.',
        thumbnailUrl: '/images/testimonials/founder-2.jpg',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
        durationText: '2:12',
        metricHighlight: '4.2x faster checkout',
      },
      {
        id: 'video-3',
        name: 'Elena Rostova',
        role: 'Head of Growth',
        company: 'Veloce Retail Group',
        quote: 'Our mobile revenue jumped within the first sprint. The level of engineering and aesthetic craft is world-class.',
        thumbnailUrl: '/images/testimonials/founder-3.jpg',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-41315-large.mp4',
        durationText: '1:30',
        metricHighlight: '+28% AOV increase',
      },
    ],
    textTestimonials: [
      {
        id: 'text-1',
        name: 'David Chen',
        role: 'VP of Product',
        company: 'Strata Cloud Systems',
        avatarUrl: '/images/testimonials/avatar-1.jpg',
        quote: 'Before Gypsym, our conversion rate was stalled at 1.8%. Within three weeks of deploying the new architecture and streamlined checkout, our qualified lead volume surged past 4.2%. They operate like an elite in-house strike team rather than an agency.',
        rating: 5,
        isRepeatClient: true,
        isFeatured: true,
        projectType: 'Full Platform Overhaul',
      },
      {
        id: 'text-2',
        name: 'Amara Okafor',
        role: 'Founder & Managing Director',
        company: 'Novi Financial Tech',
        avatarUrl: '/images/testimonials/avatar-2.jpg',
        quote: 'Their attention to detail across typography, micro-interactions, and backend resilience is unmatched. Every single launch milestone was hit without surprise delays or regressions.',
        rating: 5,
        isRepeatClient: true,
        isFeatured: false,
        projectType: 'Fintech Web Experience',
      },
      {
        id: 'text-3',
        name: 'Liam Gallagher',
        role: 'Co-Founder & COO',
        company: 'Pulse Commerce Labs',
        avatarUrl: '/images/testimonials/avatar-3.jpg',
        quote: 'The return on investment was visible within the first month. Our server response times dropped by 65% and our organic enterprise search inquiries more than doubled.',
        rating: 5,
        isRepeatClient: false,
        isFeatured: false,
        projectType: 'Headless Next.js Storefront',
      },
      {
        id: 'text-4',
        name: 'Sophie Laurent',
        role: 'Global Digital Director',
        company: 'Atelier Maison',
        avatarUrl: '/images/testimonials/avatar-4.jpg',
        quote: 'Gypsym delivered a high-fashion luxury digital experience that performs like a high-frequency trading system. Flawless animations, zero lag, and rave reviews from our VIP clients.',
        rating: 5,
        isRepeatClient: true,
        isFeatured: false,
        projectType: 'Luxury E-Commerce & CMS',
      },
    ],
    bottomTrustBar: {
      enabled: true,
      trustStatements: '85% of clients stay on after launch · 24h reply time · Enterprise Partner',
      ctaLabel: 'Book a free strategy call',
      ctaUrl: '#contact',
    },
  },
};

async function run() {
  http.get('http://localhost:4000/api/v1/pages/home', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const page = JSON.parse(data).data;
        const existing = page.sections?.find((s: any) =>
          s.sectionIdentifier === 'client-testimonials' || s.componentType === 'TESTIMONIAL_SLIDER'
        );

        if (existing) {
          console.log('Section exists with id:', existing.id, 'Updating...');
          const reqData = JSON.stringify({
            contentPayload: payload.contentPayload,
            displayOrder: 6,
            isActive: true,
          });
          const req = http.request(`http://localhost:4000/api/v1/sections/${existing.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(reqData),
            },
          }, (updateRes) => {
            let uBody = '';
            updateRes.on('data', c => uBody += c);
            updateRes.on('end', () => {
              console.log('✅ Updated section 6 successfully:', uBody);
            });
          });
          req.write(reqData);
          req.end();
        } else {
          console.log('Creating section 6...');
          const reqData = JSON.stringify(payload);
          const req = http.request('http://localhost:4000/api/v1/pages/home/sections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(reqData),
            },
          }, (createRes) => {
            let cBody = '';
            createRes.on('data', c => cBody += c);
            createRes.on('end', () => {
              console.log('✅ Created section 6 successfully:', cBody);
            });
          });
          req.write(reqData);
          req.end();
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    });
  }).on('error', (e) => {
    console.error('Connection error:', e);
  });
}

run();
