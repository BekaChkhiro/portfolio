import React from 'react';
import { FaGithub, FaExternalLinkAlt, FaReact, FaJs, FaNode, FaPython, FaHtml5, FaCss3 } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiMongodb } from 'react-icons/si';
import './Portfolio.css';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  status: 'completed' | 'in-progress' | 'planned';
}

const projects: Project[] = [
  {
    id: '1',
    title: 'ChkhiroOS Portfolio',
    description: '3D interactive portfolio website with operating system interface. Built with React, Three.js and modern web technologies.',
    technologies: ['React', 'TypeScript', 'Three.js', 'CSS3'],
    githubUrl: 'https://github.com/username/chkhiros-portfolio',
    liveUrl: 'https://chkhiros.dev',
    status: 'completed'
  },
  {
    id: '2',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce platform with admin dashboard, payment integration, and inventory management.',
    technologies: ['Next.js', 'MongoDB', 'Node.js', 'Stripe'],
    githubUrl: 'https://github.com/username/ecommerce-platform',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Task Management App',
    description: 'Collaborative task management application with real-time updates, team collaboration, and progress tracking.',
    technologies: ['React', 'Node.js', 'Socket.io', 'PostgreSQL'],
    githubUrl: 'https://github.com/username/task-manager',
    liveUrl: 'https://taskmanager.dev',
    status: 'in-progress'
  },
  {
    id: '4',
    title: 'AI Chat Assistant',
    description: 'Intelligent chatbot with natural language processing capabilities and integration with various APIs.',
    technologies: ['Python', 'OpenAI', 'FastAPI', 'React'],
    status: 'planned'
  }
];

const getTechIcon = (tech: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    'React': <FaReact color="#61DAFB" />,
    'JavaScript': <FaJs color="#F7DF1E" />,
    'TypeScript': <SiTypescript color="#3178C6" />,
    'Node.js': <FaNode color="#339933" />,
    'Next.js': <SiNextdotjs color="#000000" />,
    'Python': <FaPython color="#3776AB" />,
    'HTML5': <FaHtml5 color="#E34F26" />,
    'CSS3': <FaCss3 color="#1572B6" />,
    'Tailwind': <SiTailwindcss color="#06B6D4" />,
    'MongoDB': <SiMongodb color="#47A248" />
  };
  return icons[tech] || <span className="tech-text">{tech}</span>;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#4CAF50';
    case 'in-progress': return '#FF9800';
    case 'planned': return '#2196F3';
    default: return '#666';
  }
};

export const Portfolio: React.FC = () => {
  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <h1>🚀 My Projects</h1>
        <p>Explore my journey as a developer through these projects</p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3>{project.title}</h3>
              <div 
                className="project-status"
                style={{ backgroundColor: getStatusColor(project.status) }}
              >
                {project.status.replace('-', ' ')}
              </div>
            </div>
            
            <p className="project-description">{project.description}</p>
            
            <div className="project-technologies">
              {project.technologies.map((tech) => (
                <div key={tech} className="tech-item">
                  {getTechIcon(tech)}
                  <span>{tech}</span>
                </div>
              ))}
            </div>
            
            <div className="project-links">
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link github"
                >
                  <FaGithub /> Code
                </a>
              )}
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link live"
                >
                  <FaExternalLinkAlt /> Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="portfolio-footer">
        <div className="contact-section">
          <h2>💼 Let's Work Together</h2>
          <p>I'm always interested in new opportunities and exciting projects!</p>
          <div className="contact-links">
            <a href="mailto:your.email@example.com" className="contact-link">
              📧 Email Me
            </a>
            <a href="https://github.com/username" target="_blank" rel="noopener noreferrer" className="contact-link">
              🐙 GitHub
            </a>
            <a href="https://linkedin.com/in/username" target="_blank" rel="noopener noreferrer" className="contact-link">
              💼 LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};