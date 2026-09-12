'use client';

import * as React from 'react';

// Content status types
export type ItemStatus = 'PUBLISHED' | 'DRAFT' | 'IN_REVIEW' | 'ARCHIVED';

export interface BaseRecord {
  id: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Global CMS Initial Seed Collections
export const INITIAL_CMS_DATA: Record<string, BaseRecord[]> = {
  // 6. Users
  users: [
    {
      id: 'usr-1',
      name: 'MohammadAli Kadiwal',
      email: 'chief.architect@gypsym.com',
      role: 'SUPER_ADMIN',
      status: 'PUBLISHED',
      isTwoFactorEnabled: true,
      lastLoginAt: '2026-09-10T11:42:00Z',
      createdAt: '2026-01-15T09:00:00Z',
      updatedAt: '2026-09-10T11:42:00Z',
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova',
      email: 'elena.rostova@gypsym.com',
      role: 'ADMIN',
      status: 'PUBLISHED',
      isTwoFactorEnabled: true,
      lastLoginAt: '2026-09-09T17:15:00Z',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-09-09T17:15:00Z',
    },
    {
      id: 'usr-3',
      name: 'Marcus Vance',
      email: 'marcus.vance@gypsym.com',
      role: 'EDITOR',
      status: 'PUBLISHED',
      isTwoFactorEnabled: false,
      lastLoginAt: '2026-09-08T14:30:00Z',
      createdAt: '2026-02-10T08:30:00Z',
      updatedAt: '2026-09-08T14:30:00Z',
    },
    {
      id: 'usr-4',
      name: 'Victoria Chen',
      email: 'victoria.chen@gypsym.com',
      role: 'VIEWER',
      status: 'PUBLISHED',
      isTwoFactorEnabled: true,
      lastLoginAt: '2026-09-05T10:20:00Z',
      createdAt: '2026-03-01T11:00:00Z',
      updatedAt: '2026-09-05T10:20:00Z',
    },
  ],

  // 7. Roles
  roles: [
    {
      id: 'role-1',
      name: 'Super Administrator',
      code: 'SUPER_ADMIN',
      description: 'Unrestricted cluster-wide authority across all workspaces and audit logs.',
      userCount: 1,
      isSystem: true,
      status: 'PUBLISHED',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'role-2',
      name: 'Operations Administrator',
      code: 'ADMIN',
      description: 'Management of publishing pipelines, media library, and user accounts.',
      userCount: 3,
      isSystem: true,
      status: 'PUBLISHED',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'role-3',
      name: 'Senior Technical Editor',
      code: 'EDITOR',
      description: 'Direct editing and publishing permissions for blogs, case studies, and pages.',
      userCount: 8,
      isSystem: false,
      status: 'PUBLISHED',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'role-4',
      name: 'Compliance Auditor',
      code: 'VIEWER',
      description: 'Read-only access to published content, telemetry metrics, and immutable audit logs.',
      userCount: 2,
      isSystem: false,
      status: 'PUBLISHED',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ],

  // 8. Permissions
  permissions: [
    { id: 'perm-1', code: 'content:read', name: 'Read Content', group: 'Content', description: 'View pages, services, solutions and blogs', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-2', code: 'content:write', name: 'Write Content', group: 'Content', description: 'Create and edit drafts', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-3', code: 'content:publish', name: 'Publish Content', group: 'Content', description: 'Publish and unpublish active web content', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-4', code: 'content:delete', name: 'Delete Content', group: 'Content', description: 'Purge content entries and sections', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-5', code: 'media:manage', name: 'Manage Media', group: 'Media', description: 'Upload, tag, and organize DAM assets', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-6', code: 'site:manage', name: 'Manage Site Settings', group: 'Site', description: 'Modify branding, navigation, and SEO presets', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-7', code: 'users:manage', name: 'Manage IAM Users', group: 'System', description: 'Invite, edit, and revoke user access', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: 'perm-8', code: 'audit:read', name: 'Read Audit Ledger', group: 'System', description: 'Inspect cryptographic audit logs and diffs', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  ],

  // 12. Pages (Only Home Page with 2 sections)
  pages: [
    {
      id: 'home',
      title: 'Home',
      slug: '/',
      layout: 'LANDING',
      sectionsCount: 2,
      revisionsCount: 1,
      author: 'MohammadAli Kadiwal',
      status: 'PUBLISHED',
      seoTitle: 'Engineering the Global Enterprise Architecture',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-09-11T07:04:00Z',
    },
  ],

  // 15. Media (DAM)
  media: [
    {
      id: 'med-1',
      filename: 'gypsym-monogram-white.svg',
      title: 'Gypsym Monogram Icon',
      folder: '/Logos',
      mimeType: 'image/svg+xml',
      sizeBytes: 14200,
      width: 512,
      height: 512,
      altText: 'Gypsym Technology primary monogram mark in white',
      status: 'PUBLISHED',
      usageCount: 8,
      url: 'https://assets.gypsym.com/logos/monogram-white.svg',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'med-2',
      filename: 'apex-capital-case-study-hero.webp',
      title: 'Apex Capital Derivatives Trading Terminal',
      folder: '/Case-Studies',
      mimeType: 'image/webp',
      sizeBytes: 345000,
      width: 2400,
      height: 1350,
      altText: 'Apex Capital high-frequency derivatives clearing engine dashboard',
      status: 'PUBLISHED',
      usageCount: 3,
      url: 'https://assets.gypsym.com/case-studies/apex-terminal.webp',
      createdAt: '2026-02-12T14:00:00Z',
      updatedAt: '2026-02-12T14:00:00Z',
    },
    {
      id: 'med-3',
      filename: 'federated-learning-topology.png',
      title: 'Federated Learning Ring Diagram',
      folder: '/Blog',
      mimeType: 'image/png',
      sizeBytes: 420000,
      width: 1920,
      height: 1080,
      altText: 'Network topology showing 60+ hospitals training diagnostic models locally',
      status: 'PUBLISHED',
      usageCount: 2,
      url: 'https://assets.gypsym.com/blog/federated-topology.png',
      createdAt: '2026-03-01T09:30:00Z',
      updatedAt: '2026-03-01T09:30:00Z',
    },
    {
      id: 'med-4',
      filename: 'london-hq-bishopsgate.jpg',
      title: 'London 100 Bishopsgate Global HQ',
      folder: '/Banners',
      mimeType: 'image/jpeg',
      sizeBytes: 890000,
      width: 3840,
      height: 2160,
      altText: 'Gypsym Technology Global Headquarters at 100 Bishopsgate London',
      status: 'PUBLISHED',
      usageCount: 4,
      url: 'https://assets.gypsym.com/banners/bishopsgate.jpg',
      createdAt: '2026-01-15T12:00:00Z',
      updatedAt: '2026-01-15T12:00:00Z',
    },
  ],

  // 16. Services
  services: [
    {
      id: 'srv-1',
      title: 'Enterprise Cloud Modernization',
      slug: 'cloud-modernization',
      tagline: 'Zero-Downtime Planetary Migration',
      shortDescription: 'Transform legacy infrastructure into distributed multi-cloud architectures with automated compliance.',
      category: 'Cloud Infrastructure',
      technologies: ['Kubernetes', 'AWS', 'Google Cloud', 'Terraform', 'Istio'],
      status: 'PUBLISHED',
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'srv-2',
      title: 'Enterprise AI & Machine Learning Systems',
      slug: 'ai-transformation',
      tagline: 'Private, Sovereign LLM Platforms',
      shortDescription: 'Productionize generative and analytical AI pipelines directly on private enterprise infrastructure.',
      category: 'Artificial Intelligence',
      technologies: ['PyTorch', 'NVIDIA Triton', 'Pinecone', 'vLLM', 'PostgreSQL pgvector'],
      status: 'PUBLISHED',
      createdAt: '2026-01-22T00:00:00Z',
      updatedAt: '2026-09-02T11:00:00Z',
    },
    {
      id: 'srv-3',
      title: 'High-Throughput Distributed Systems',
      slug: 'distributed-systems',
      tagline: 'Sub-Millisecond Transactional Latency',
      shortDescription: 'Engineer resilient, event-driven streaming backbones designed to handle millions of transactions per second.',
      category: 'Core Engineering',
      technologies: ['Apache Kafka', 'Rust', 'Go', 'Redis Cluster', 'gRPC'],
      status: 'PUBLISHED',
      createdAt: '2026-02-05T00:00:00Z',
      updatedAt: '2026-09-03T09:00:00Z',
    },
    {
      id: 'srv-4',
      title: 'Zero Trust Cybersecurity & Sovereignty',
      slug: 'cybersecurity-zero-trust',
      tagline: 'Continuous Identity & Perimeter Defense',
      shortDescription: 'Cryptographic zero-trust architectures satisfying stringent ISO 27001, SOC 2, and sovereign banking mandates.',
      category: 'Security & Defense',
      technologies: ['HashiCorp Vault', 'SPIFFE/SPIRE', 'Cloudflare WAF', 'eBPF', 'OIDC'],
      status: 'PUBLISHED',
      createdAt: '2026-02-10T00:00:00Z',
      updatedAt: '2026-09-04T15:00:00Z',
    },
  ],

  // 17. Solutions
  solutions: [
    {
      id: 'sol-1',
      title: 'Next-Gen Core Banking & Real-Time Settlement',
      slug: 'core-banking-modernization',
      industry: 'Financial Services',
      roi: 'Reduced transaction processing costs by 64% and eliminated overnight batch windows.',
      compliance: ['PCI-DSS Level 1', 'SOC 2 Type II', 'Basel III', 'ISO 20022'],
      status: 'PUBLISHED',
      createdAt: '2026-01-25T00:00:00Z',
      updatedAt: '2026-08-28T12:00:00Z',
    },
    {
      id: 'sol-2',
      title: 'HIPAA-Compliant Sovereign Healthcare Hub',
      slug: 'healthcare-data-interoperability',
      industry: 'Healthcare & Life Sciences',
      roi: 'Accelerated clinical data access speeds by 88% with zero security citations.',
      compliance: ['HIPAA', 'HITECH', 'GDPR Article 9', 'FDA 21 CFR Part 11'],
      status: 'PUBLISHED',
      createdAt: '2026-02-02T00:00:00Z',
      updatedAt: '2026-08-29T14:30:00Z',
    },
    {
      id: 'sol-3',
      title: 'Carrier-Grade 5G Edge Network Orchestrator',
      slug: 'telecom-5g-edge-orchestration',
      industry: 'Telecommunications',
      roi: 'Lowered backhaul transmission costs by 73% with sub-5ms latency.',
      compliance: ['3GPP Release 16', 'ETSI MEC', 'ISO 27001'],
      status: 'PUBLISHED',
      createdAt: '2026-02-12T00:00:00Z',
      updatedAt: '2026-08-30T16:00:00Z',
    },
  ],

  // 18. Industries
  industries: [
    {
      id: 'ind-1',
      name: 'Financial Services & Capital Markets',
      slug: 'financial-services',
      summary: 'Real-time clearing, double-entry settlement engines, and automated SEC/Basel III reporting.',
      activeClientsCount: 14,
      status: 'PUBLISHED',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    },
    {
      id: 'ind-2',
      name: 'Healthcare & Life Sciences',
      slug: 'healthcare-life-sciences',
      summary: 'HIPAA sovereign data lakes, diagnostic AI, and encrypted clinical integration meshes.',
      activeClientsCount: 9,
      status: 'PUBLISHED',
      createdAt: '2026-01-12T00:00:00Z',
      updatedAt: '2026-08-22T11:00:00Z',
    },
    {
      id: 'ind-3',
      name: 'Telecommunications & 5G Edge',
      slug: 'telecommunications',
      summary: 'Carrier-grade edge compute fabrics and ultra-reliable low-latency networks.',
      activeClientsCount: 6,
      status: 'PUBLISHED',
      createdAt: '2026-01-14T00:00:00Z',
      updatedAt: '2026-08-24T12:00:00Z',
    },
    {
      id: 'ind-4',
      name: 'Public Sector & Sovereign Defense',
      slug: 'public-sector-defense',
      summary: 'Zero-trust micro-segmentation and air-gapped sovereign cloud deployments.',
      activeClientsCount: 4,
      status: 'PUBLISHED',
      createdAt: '2026-01-16T00:00:00Z',
      updatedAt: '2026-08-26T14:00:00Z',
    },
  ],

  // 19. Technologies
  technologies: [
    { id: 'tech-1', name: 'Rust', category: 'Languages & Distributed', ring: 'Adopt', description: 'Zero-cost abstractions for core financial ledgers.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
    { id: 'tech-2', name: 'Go', category: 'Languages & Distributed', ring: 'Adopt', description: 'High-concurrency micro-services and Kubernetes controllers.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
    { id: 'tech-3', name: 'Apache Kafka', category: 'Event Streaming', ring: 'Adopt', description: 'Deterministic partition-ordered event streaming backbones.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
    { id: 'tech-4', name: 'vLLM & Triton', category: 'AI & Inference', ring: 'Adopt', description: 'PagedAttention GPU memory management for sovereign LLMs.', status: 'PUBLISHED', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
    { id: 'tech-5', name: 'PostgreSQL + pgvector', category: 'Databases', ring: 'Adopt', description: 'Unified relational ACID data and high-dimensional semantic search.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
    { id: 'tech-6', name: 'Pinecone / Milvus', category: 'Vector Search', ring: 'Trial', description: 'Extreme-scale vector search clustering beyond 100M embeddings.', status: 'PUBLISHED', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
  ],

  // 20. Case Studies
  caseStudies: [
    {
      id: 'cs-1',
      title: 'Transforming Global Derivatives Clearing for Apex Capital',
      slug: 'apex-capital-ledger-transformation',
      client: 'Apex Capital Management',
      industry: 'Financial Services',
      dailyVolume: '$40B+',
      settlementLatency: '10ms',
      uptime: '99.999%',
      status: 'PUBLISHED',
      createdAt: '2026-02-10T00:00:00Z',
      updatedAt: '2026-08-25T11:00:00Z',
    },
    {
      id: 'cs-2',
      title: 'Federated Diagnostic AI Platform for Global Health Systems',
      slug: 'global-health-federated-ai',
      client: 'Global Health Systems',
      industry: 'Healthcare & Life Sciences',
      accuracy: '99.2%',
      connectedHospitals: '60+',
      dataTransferred: '0 Bytes',
      status: 'PUBLISHED',
      createdAt: '2026-02-18T00:00:00Z',
      updatedAt: '2026-08-27T14:00:00Z',
    },
  ],

  // 21. Projects
  projects: [
    { id: 'prj-1', title: 'gypsym-consensus-rs', language: 'Rust', category: 'Raft Consensus', stars: '1.2k', license: 'Apache-2.0', status: 'PUBLISHED', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-08-30T00:00:00Z' },
    { id: 'prj-2', title: 'sovereign-rag-mesh', language: 'Python', category: 'Vector Search', stars: '850', license: 'MIT', status: 'PUBLISHED', createdAt: '2026-02-05T00:00:00Z', updatedAt: '2026-08-30T00:00:00Z' },
    { id: 'prj-3', title: 'turbomesh-ebpf', language: 'C', category: 'eBPF Networking', stars: '2.1k', license: 'GPL-2.0', status: 'PUBLISHED', createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-08-30T00:00:00Z' },
  ],

  // 21b. Portfolio / Our Work
  portfolio: [
    {
      id: 'port-1',
      orderNumber: '01',
      title: 'Apex Capital Derivatives Exchange',
      client: 'Apex Capital Management',
      category: 'Financial Infrastructure',
      metrics: '$40B+ Daily Volume',
      projectUrl: '/portfolio/apex-capital-derivatives',
      imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop',
      status: 'PUBLISHED',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    },
    {
      id: 'port-2',
      orderNumber: '02',
      title: 'Sovereign RAG Neural Knowledge Mesh',
      client: 'Sovereign Cloud AI',
      category: 'Generative AI & Search',
      metrics: '250M+ Vectors',
      projectUrl: '/portfolio/sovereign-rag-mesh',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      status: 'PUBLISHED',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    },
    {
      id: 'port-3',
      orderNumber: '03',
      title: 'Global Telecommunications Edge Network',
      client: 'Vanguard Telecom',
      category: 'Distributed Edge Systems',
      metrics: '48 Global PoPs',
      projectUrl: '/portfolio/turbomesh-edge-network',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1800&auto=format&fit=crop',
      status: 'PUBLISHED',
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    },
    {
      id: 'port-4',
      orderNumber: '04',
      title: 'Federated Health Diagnostic Intelligence',
      client: 'Global Health Systems',
      category: 'Healthcare & Life Sciences',
      metrics: '60+ Hospitals Connected',
      projectUrl: '/portfolio/federated-health-diagnostics',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
      status: 'PUBLISHED',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    },
    {
      id: 'port-5',
      orderNumber: '05',
      title: 'Autonomous Multi-Store Commerce Engine',
      client: 'Aura Luxury Group',
      category: 'Enterprise Headless Commerce',
      metrics: '+42% Conversion',
      projectUrl: '/portfolio/aura-luxury-commerce',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
      status: 'PUBLISHED',
      createdAt: '2026-02-10T00:00:00Z',
      updatedAt: '2026-08-30T00:00:00Z',
    },
  ],

  // 22. Clients
  clients: [
    { id: 'cl-1', name: 'Apex Capital Management', tier: 'Tier-1 Investment Bank', industry: 'Financial Services', logoText: 'APEX CAPITAL', status: 'PUBLISHED', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
    { id: 'cl-2', name: 'Global Health Systems', tier: 'Enterprise Healthcare Network', industry: 'Healthcare', logoText: 'GHS HEALTH', status: 'PUBLISHED', createdAt: '2026-01-12T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
    { id: 'cl-3', name: 'Vanguard Telecom', tier: 'Tier-1 Telecommunications Operator', industry: 'Telecommunications', logoText: 'VANGUARD', status: 'PUBLISHED', createdAt: '2026-01-14T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
    { id: 'cl-4', name: 'Sovereign Cloud AI', tier: 'Public Sector Cloud Operator', industry: 'Cloud & AI', logoText: 'SOVEREIGN', status: 'PUBLISHED', createdAt: '2026-01-16T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  ],

  // 23. Testimonials
  testimonials: [
    { id: 'tst-1', clientName: 'David Sterling', role: 'CTO, Apex Capital', quote: 'Gypsym delivered what three tier-1 consultancies declared impossible: replacing our core clearing engine without downtime.', rating: 5, status: 'PUBLISHED', createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-08-12T00:00:00Z' },
    { id: 'tst-2', clientName: 'Dr. Evelyn Reed', role: 'CMIO, Global Health Systems', quote: 'Gypsym’s architectural rigor enabled our medical network to advance clinical research by a decade with zero privacy leaks.', rating: 5, status: 'PUBLISHED', createdAt: '2026-02-25T00:00:00Z', updatedAt: '2026-08-14T00:00:00Z' },
  ],

  // 24. Team
  team: [
    { id: 'tm-1', name: 'MohammadAli Kadiwal', role: 'CEO & Chief Architect', department: 'Executive', bio: 'Pioneered planetary-scale distributed systems across global investment banks.', isLeadership: true, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
    { id: 'tm-2', name: 'Marcus Vance', role: 'COO & Strategic Delivery', department: 'Executive', bio: 'Former VP of Technology Transformation at Fortune 50 financial institutions.', isLeadership: true, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
    { id: 'tm-3', name: 'Elena Rostova', role: 'VP of AI Systems Engineering', department: 'Research & AI', bio: 'Distributed systems and machine learning specialist in federated learning.', isLeadership: true, status: 'PUBLISHED', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
    { id: 'tm-4', name: 'Victoria Chen', role: 'Head of Cyber Defense', department: 'Security', bio: 'Recognized authority on Zero-Trust architectures for sovereign cloud environments.', isLeadership: true, status: 'PUBLISHED', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-08-10T00:00:00Z' },
  ],

  // 25. Careers
  careers: [
    { id: 'car-1', title: 'Global Remote First', category: 'Culture', description: 'Work from wherever you are most productive with generous home-office stipends.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'car-2', title: 'Equity & Sovereignty', category: 'Benefits', description: 'Competitive compensation packages with meaningful equity ownership in Gypsym.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'car-3', title: '20% Research Allocation', category: 'Growth', description: 'Dedicated time to author open source projects, file patents, and present at conferences.', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  ],

  // 26. Jobs
  jobs: [
    {
      id: 'job-1',
      title: 'Principal Distributed Systems Engineer',
      requisitionCode: 'GYP-ENG-2026-01',
      department: 'Distributed Systems',
      location: 'London, UK / Remote',
      type: 'Full-Time',
      experience: 'Principal (8+ Years)',
      applicantsCount: 18,
      status: 'PUBLISHED',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'job-2',
      title: 'Lead AI Platform & Inference Engineer',
      requisitionCode: 'GYP-ENG-2026-02',
      department: 'AI & Research',
      location: 'New York, USA / Hybrid',
      type: 'Full-Time',
      experience: 'Lead (6+ Years)',
      applicantsCount: 27,
      status: 'PUBLISHED',
      createdAt: '2026-02-05T00:00:00Z',
      updatedAt: '2026-09-02T00:00:00Z',
    },
  ],

  // 27. Blog
  blogs: [
    {
      id: 'blg-1',
      title: 'Scaling Distributed Workloads with Zero Drift: Lessons from $40B Daily Throughput',
      slug: 'scaling-distributed-workloads-zero-drift',
      category: 'Architecture',
      author: 'MohammadAli Kadiwal',
      readTime: '8 min',
      publishedAt: '2026-09-02',
      viewsCount: 14200,
      status: 'PUBLISHED',
      createdAt: '2026-08-25T00:00:00Z',
      updatedAt: '2026-09-02T00:00:00Z',
    },
    {
      id: 'blg-2',
      title: 'The Sovereign AI Mandate: Why Enterprise LLMs Must Run Inside Your Tenant',
      slug: 'sovereign-ai-enterprise-infrastructure',
      category: 'Artificial Intelligence',
      author: 'Elena Rostova',
      readTime: '6 min',
      publishedAt: '2026-08-24',
      viewsCount: 9800,
      status: 'PUBLISHED',
      createdAt: '2026-08-18T00:00:00Z',
      updatedAt: '2026-08-24T00:00:00Z',
    },
    {
      id: 'blg-3',
      title: 'Zero-Trust Service Meshes: Eliminating Implicit Trust in Multi-Cloud Clusters',
      slug: 'zero-trust-kubernetes-mesh',
      category: 'Cybersecurity',
      author: 'Marcus Vance',
      readTime: '10 min',
      publishedAt: '2026-08-12',
      viewsCount: 11400,
      status: 'PUBLISHED',
      createdAt: '2026-08-05T00:00:00Z',
      updatedAt: '2026-08-12T00:00:00Z',
    },
  ],

  // 28. Categories
  categories: [
    { id: 'cat-1', name: 'Architecture & Distributed Systems', slug: 'architecture', count: 12, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'cat-2', name: 'Artificial Intelligence', slug: 'ai', count: 8, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'cat-3', name: 'Cybersecurity & Governance', slug: 'cybersecurity', count: 9, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  ],

  // 29. Tags
  tags: [
    { id: 'tag-1', name: 'Kubernetes', slug: 'kubernetes', count: 16, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-2', name: 'Raft Consensus', slug: 'raft-consensus', count: 8, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-3', name: 'Zero Trust', slug: 'zero-trust', count: 14, status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'tag-4', name: 'vLLM', slug: 'vllm', count: 6, status: 'PUBLISHED', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  ],

  // 30. FAQs
  faqs: [
    {
      id: 'faq-1',
      question: 'How does Gypsym guarantee zero downtime during core banking migrations?',
      answer: 'We utilize dual-write shadow pipelines and deterministic Raft consensus engines to maintain state parity before triggering non-disruptive DNS cutovers.',
      category: 'Engineering & Migration',
      sortOrder: 1,
      status: 'PUBLISHED',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-08-10T00:00:00Z',
    },
    {
      id: 'faq-2',
      question: 'Does proprietary client IP or training data ever touch external public AI servers?',
      answer: 'Never. All model inference and vector retrieval run strictly within air-gapped or sovereign enterprise tenancies with zero external telemetry egress.',
      category: 'Security & Sovereignty',
      sortOrder: 2,
      status: 'PUBLISHED',
      createdAt: '2026-01-18T00:00:00Z',
      updatedAt: '2026-08-10T00:00:00Z',
    },
  ],

  // 31. Certifications
  certifications: [
    { id: 'crt-1', name: 'ISO/IEC 27001:2022', issuer: 'BSI Global', validUntil: '2028-12-31', scope: 'Global Enterprise Cloud & Software Engineering', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'crt-2', name: 'SOC 2 Type II Certified', issuer: 'Ernst & Young', validUntil: '2027-06-30', scope: 'Security, Availability, and Confidentiality Trust Principles', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'crt-3', name: 'PCI-DSS v4.0 Level 1', issuer: 'QSA International', validUntil: '2027-09-30', scope: 'Transactional Clearing & Payment Gateway Infrastructure', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  ],

  // 32. Awards
  awards: [
    { id: 'awd-1', title: 'Global Banking Infrastructure Leader 2026', organization: 'FinTech Futures Awards', year: 2026, category: 'Core Modernization', status: 'PUBLISHED', createdAt: '2026-05-10T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'awd-2', title: 'Enterprise Sovereign AI Innovation Award', organization: 'Gartner Tech Excellence', year: 2026, category: 'Artificial Intelligence', status: 'PUBLISHED', createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  ],

  // 33. Partners
  partners: [
    { id: 'prt-1', name: 'Amazon Web Services', tier: 'Premier Tier Services Partner', competencies: 'Financial Services, Migration, Security', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'prt-2', name: 'Google Cloud Platform', tier: 'Premier Partner - Cloud Infrastructure', competencies: 'Kubernetes, Vertex AI, Lakehouse', status: 'PUBLISHED', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
    { id: 'prt-3', name: 'NVIDIA AI Inception Partner', tier: 'Elite Solution Collaborator', competencies: 'Triton, TensorRT-LLM, Accelerated Inference', status: 'PUBLISHED', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  ],

  // 34. Contact Submissions
  inbox: [
    {
      id: 'inb-1',
      fullName: 'Alexander Vance',
      workEmail: 'a.vance@citadelpartners.com',
      companyName: 'Citadel Partners UK',
      interestArea: 'Cloud Modernization',
      projectScope: 'Replacing monolithic ledger with low-latency event mesh.',
      estimatedBudget: '$500K - $1M',
      timeline: '1-3 Months',
      triageStatus: 'NEW',
      status: 'PUBLISHED',
      createdAt: '2026-09-10T10:15:00Z',
      updatedAt: '2026-09-10T10:15:00Z',
    },
    {
      id: 'inb-2',
      fullName: 'Sarah Jenkins',
      workEmail: 'sarah.j@novapharma.ch',
      companyName: 'Nova Pharma AG',
      interestArea: 'AI & Machine Learning',
      projectScope: 'Sovereign clinical LLM deployment on-premises in Zurich.',
      estimatedBudget: '$1M+',
      timeline: 'Immediate',
      triageStatus: 'IN_REVIEW',
      status: 'PUBLISHED',
      createdAt: '2026-09-09T14:30:00Z',
      updatedAt: '2026-09-09T16:00:00Z',
    },
  ],

  // 35. Newsletter
  newsletter: [
    { id: 'nws-1', email: 'director.engineering@barclays.com', source: 'Home Footer', subscribedAt: '2026-09-09T08:20:00Z', status: 'PUBLISHED', createdAt: '2026-09-09T08:20:00Z', updatedAt: '2026-09-09T08:20:00Z' },
    { id: 'nws-2', email: 'cloud.lead@credit-suisse.ch', source: 'Blog Post b1', subscribedAt: '2026-09-08T11:45:00Z', status: 'PUBLISHED', createdAt: '2026-09-08T11:45:00Z', updatedAt: '2026-09-08T11:45:00Z' },
    { id: 'nws-3', email: 'head.devops@vodafone.co.uk', source: '5G Solutions Page', subscribedAt: '2026-09-07T16:10:00Z', status: 'PUBLISHED', createdAt: '2026-09-07T16:10:00Z', updatedAt: '2026-09-07T16:10:00Z' },
  ],

  // 37. Audit Logs
  audit: [
    {
      id: 'aud-1',
      actor: 'MohammadAli Kadiwal',
      actorRole: 'SUPER_ADMIN',
      action: 'PUBLISH_PAGE',
      resource: 'Page (/)',
      ipAddress: '194.207.12.4',
      timestamp: '2026-09-10T11:45:00Z',
      diff: {
        before: { status: 'DRAFT', publishedAt: null },
        after: { status: 'PUBLISHED', publishedAt: '2026-09-10T11:45:00Z' },
      },
      status: 'PUBLISHED',
      createdAt: '2026-09-10T11:45:00Z',
      updatedAt: '2026-09-10T11:45:00Z',
    },
    {
      id: 'aud-2',
      actor: 'Elena Rostova',
      actorRole: 'ADMIN',
      action: 'CREATE_ASSET',
      resource: 'Media (/Blog/federated-topology.png)',
      ipAddress: '82.165.197.1',
      timestamp: '2026-09-10T09:20:00Z',
      diff: {
        before: null,
        after: { filename: 'federated-topology.png', sizeBytes: 420000 },
      },
      status: 'PUBLISHED',
      createdAt: '2026-09-10T09:20:00Z',
      updatedAt: '2026-09-10T09:20:00Z',
    },
    {
      id: 'aud-3',
      actor: 'Marcus Vance',
      actorRole: 'EDITOR',
      action: 'UPDATE_JOB',
      resource: 'Job (GYP-ENG-2026-01)',
      ipAddress: '213.127.88.90',
      timestamp: '2026-09-09T16:10:00Z',
      diff: {
        before: { status: 'DRAFT' },
        after: { status: 'PUBLISHED' },
      },
      status: 'PUBLISHED',
      createdAt: '2026-09-09T16:10:00Z',
      updatedAt: '2026-09-09T16:10:00Z',
    },
  ],

  // 38. Notifications
  notifications: [
    {
      id: 'notif-1',
      title: 'New Executive Briefing Request',
      message: 'Alexander Vance (Citadel Partners UK) scheduled an architectural consultation.',
      category: 'LEAD',
      isRead: false,
      timestamp: '15 minutes ago',
      status: 'PUBLISHED',
      createdAt: '2026-09-10T11:35:00Z',
      updatedAt: '2026-09-10T11:35:00Z',
    },
    {
      id: 'notif-2',
      title: 'Page Published to Cluster',
      message: 'Global Homepage (/) successfully published across all global edge regions.',
      category: 'CMS',
      isRead: false,
      timestamp: '1 hour ago',
      status: 'PUBLISHED',
      createdAt: '2026-09-10T10:45:00Z',
      updatedAt: '2026-09-10T10:45:00Z',
    },
    {
      id: 'notif-3',
      title: 'Automated Compliance Scan Passed',
      message: 'Zero-trust ISO 27001 perimeter audit completed with zero vulnerabilities found.',
      category: 'SECURITY',
      isRead: true,
      timestamp: '4 hours ago',
      status: 'PUBLISHED',
      createdAt: '2026-09-10T08:00:00Z',
      updatedAt: '2026-09-10T08:00:00Z',
    },
  ],
};

// Site settings singleton state
export const INITIAL_SITE_SETTINGS = {
  companyName: 'Gypsym Technology Inc.',
  tagline: 'Engineering the Global Enterprise',
  primaryEmail: 'briefing@gypsym.com',
  primaryPhone: '+44 20 7946 0991',
  headquarters: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
  legalJurisdiction: 'England & Wales (Company No. 11849201)',
  defaultTimezone: 'Europe/London (UTC+1)',
  clusterEnvironment: 'PRODUCTION (EMEA-1)',
};

// Branding settings singleton state
export const INITIAL_BRANDING = {
  companyName: 'Gypsym Technology',
  defaultTheme: 'dark' as 'dark' | 'light' | 'system',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e293b',
  accentColor: '#60a5fa',
  lightBgColor: '#f4f3ef',
  darkBgColor: '#030712',
  surfaceDark: '#030712',
  surfaceLight: '#ffffff',
  fontFamily: 'Inter',
  fontSizeScale: 1.0,
  logoHeight: 32,
  logoLightUrl: 'https://assets.gypsym.com/logos/logo-light.svg',
  logoDarkUrl: 'https://assets.gypsym.com/logos/logo-dark.svg',
  faviconUrl: '/favicon.ico',
};

// SEO settings singleton state
export const INITIAL_SEO = {
  defaultTitle: 'Gypsym Technology | Planetary Scale Enterprise Engineering',
  defaultDescription: 'Gypsym Technology partners with Fortune 100 leaders to architect zero-downtime cloud cores, sovereign AI ecosystems, and high-frequency distributed ledgers.',
  canonicalDomain: 'https://gypsym.com',
  openGraphImage: 'https://assets.gypsym.com/banners/og-default.jpg',
  twitterHandle: '@GypsymTech',
  robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://gypsym.com/sitemap.xml",
  autoGenerateSitemap: true,
};

// Navigation settings
export const INITIAL_NAVIGATION = {
  headerLinks: [
    { label: 'Solutions', href: '/solutions' },
    { label: 'Services', href: '/services' },
    { label: 'Industries', href: '/industries' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Technology', href: '/technology' },
    { label: 'Company', href: '/about' },
    { label: 'Insights', href: '/blog' },
  ],
  footerColumns: [
    {
      title: 'Capabilities',
      links: [
        { label: 'Cloud Modernization', href: '/services/cloud-modernization' },
        { label: 'Enterprise AI & ML', href: '/services/ai-transformation' },
        { label: 'Distributed Systems', href: '/services/distributed-systems' },
        { label: 'Zero-Trust Cybersecurity', href: '/services/cybersecurity-zero-trust' },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'Core Banking Ledger', href: '/solutions/core-banking-modernization' },
        { label: 'Healthcare Data Mesh', href: '/solutions/healthcare-data-interoperability' },
        { label: '5G Edge Orchestrator', href: '/solutions/telecom-5g-edge-orchestration' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Gypsym', href: '/about' },
        { label: 'Executive Team', href: '/team' },
        { label: 'Clients & Alliances', href: '/clients' },
        { label: 'Careers (Hiring)', href: '/careers' },
        { label: 'Contact & Offices', href: '/contact' },
      ],
    },
  ],
};

// Custom Hook to manage any CMS collection with local persistence
export function useCmsCollection<T extends BaseRecord>(collectionKey: string) {
  const [data, setData] = React.useState<T[]>(() => {
    if (typeof window === 'undefined') return (INITIAL_CMS_DATA[collectionKey] || []) as T[];
    const stored = localStorage.getItem(`gypsym_cms_${collectionKey}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return (INITIAL_CMS_DATA[collectionKey] || []) as T[];
  });

  const saveToStorage = React.useCallback(
    (newItems: T[]) => {
      setData(newItems);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`gypsym_cms_${collectionKey}`, JSON.stringify(newItems));
      }
    },
    [collectionKey]
  );

  const createItem = React.useCallback(
    (item: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ItemStatus }) => {
      const now = new Date().toISOString();
      const newItem = {
        ...item,
        id: `${collectionKey.substring(0, 3)}-${Date.now()}`,
        status: item.status || 'PUBLISHED',
        createdAt: now,
        updatedAt: now,
      } as unknown as T;
      const updated = [newItem, ...data];
      saveToStorage(updated);
      return newItem;
    },
    [data, collectionKey, saveToStorage]
  );

  const updateItem = React.useCallback(
    (id: string, updates: Partial<T>) => {
      const now = new Date().toISOString();
      const updated = data.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates, updatedAt: now };
        }
        return item;
      });
      saveToStorage(updated);
    },
    [data, saveToStorage]
  );

  const deleteItem = React.useCallback(
    (id: string) => {
      const updated = data.filter((item) => item.id !== id);
      saveToStorage(updated);
    },
    [data, saveToStorage]
  );

  const bulkDelete = React.useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const updated = data.filter((item) => !idSet.has(item.id));
      saveToStorage(updated);
    },
    [data, saveToStorage]
  );

  const bulkUpdateStatus = React.useCallback(
    (ids: string[], status: ItemStatus) => {
      const idSet = new Set(ids);
      const now = new Date().toISOString();
      const updated = data.map((item) => {
        if (idSet.has(item.id)) {
          return { ...item, status, updatedAt: now };
        }
        return item;
      });
      saveToStorage(updated);
    },
    [data, saveToStorage]
  );

  return {
    data,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    bulkUpdateStatus,
  };
}
