import http from 'http';

const payload = {
  sectionIdentifier: 'delivery-process',
  componentType: 'TABBED_SOLUTIONS',
  displayOrder: 5,
  isActive: true,
  contentPayload: {
    eyebrow: 'DELIVERY METHODOLOGY',
    title: 'Our Four Step Delivery Process',
    titleHighlight: 'Process',
    description: 'Our process is built to deliver clarity, consistency, and results at every stage. By combining strategy, design, and execution, we ensure each website is thoughtfully crafted, aligned with your goals, and optimized for long-term performance.',
    scrollHintText: 'Scroll to see our process',
    stickyScrollEnabled: true,
    steps: [
      {
        id: 'step-1',
        stepNumber: '.01',
        title: 'Discovery & Strategy',
        description: "We start with your business, your buyers, and the search landscape you're competing in (both Google and AI). Then we map what matters. The opportunities, the risks, the metrics that guide every decision from here.",
        imageUrl: '/images/process/step-1.jpg',
        altText: 'Discovery & Strategy workshop with team and stakeholders'
      },
      {
        id: 'step-2',
        stepNumber: '.02',
        title: 'Architecture & UX',
        description: 'Conversion pathways, technical architecture, and interactive wireframes engineered to eliminate friction, accelerate page speeds, and retain qualified enterprise buyers.',
        imageUrl: '/images/process/step-2.jpg',
        altText: 'Scalable cloud architecture and interactive wireframes'
      },
      {
        id: 'step-3',
        stepNumber: '.03',
        title: 'Design & Prototype',
        description: 'Bespoke design systems, typography tokens, component libraries, and interactive prototypes bringing your enterprise brand identity to life with pixel precision.',
        imageUrl: '/images/process/step-3.jpg',
        altText: 'Design system and typography tokens in Figma'
      },
      {
        id: 'step-4',
        stepNumber: '.04',
        title: 'Build, Ship, Keep Improving',
        description: 'Modern engineering, headless infrastructure, automated CI/CD pipelines, Core Web Vitals optimization, and continuous conversion experiments after launch.',
        imageUrl: '/images/process/step-4.jpg',
        altText: 'Production engineering and deployment telemetry'
      }
    ]
  }
};

async function run() {
  // First check if section already exists on home
  http.get('http://localhost:4000/api/v1/pages/home', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const page = JSON.parse(data).data;
        const existing = page.sections?.find((s: any) => s.sectionIdentifier === 'delivery-process');
        
        if (existing) {
          console.log('Section exists with id:', existing.id, 'Updating...');
          const reqData = JSON.stringify({
            contentPayload: payload.contentPayload,
            displayOrder: 5,
            isActive: true
          });
          const req = http.request(`http://localhost:4000/api/v1/sections/${existing.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(reqData)
            }
          }, (updateRes) => {
            let uBody = '';
            updateRes.on('data', c => uBody += c);
            updateRes.on('end', () => {
              console.log('✅ Updated section 5 successfully:', uBody);
            });
          });
          req.write(reqData);
          req.end();
        } else {
          console.log('Creating section 5...');
          const reqData = JSON.stringify(payload);
          const req = http.request('http://localhost:4000/api/v1/pages/home/sections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(reqData)
            }
          }, (createRes) => {
            let cBody = '';
            createRes.on('data', c => cBody += c);
            createRes.on('end', () => {
              console.log('✅ Created section 5 successfully:', cBody);
            });
          });
          req.write(reqData);
          req.end();
        }
      } catch (err) {
        console.error('Error:', err);
      }
    });
  });
}

run();
