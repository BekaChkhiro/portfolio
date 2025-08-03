import React from 'react';
import { TextEditor } from '../TextEditor/TextEditor';

const aboutMeContent = `
<h1 style="color: #2c3e50; margin-bottom: 20px;">👋 About Me - Beka Chkhirodze</h1>

<h2 style="color: #34495e; margin-top: 24px; margin-bottom: 12px;">🚀 Developer & Creator</h2>
<p style="margin-bottom: 16px;">
  Hello! I'm Beka Chkhirodze, a passionate software developer with a love for creating innovative digital experiences. 
  Welcome to <strong>ChkhiroOS</strong> - my personal operating system simulation built with React and Three.js!
</p>

<h2 style="color: #34495e; margin-top: 24px; margin-bottom: 12px;">💻 Technical Skills</h2>
<ul style="margin-bottom: 16px;">
  <li><strong>Frontend:</strong> React, TypeScript, JavaScript, HTML5, CSS3</li>
  <li><strong>3D Graphics:</strong> Three.js, React Three Fiber</li>
  <li><strong>Backend:</strong> Node.js, Express, Python</li>
  <li><strong>Databases:</strong> MongoDB, PostgreSQL, MySQL</li>
  <li><strong>Tools:</strong> Git, Docker, VS Code, Figma</li>
  <li><strong>Cloud:</strong> AWS, Vercel, Netlify</li>
</ul>

<h2 style="color: #34495e; margin-top: 24px; margin-bottom: 12px;">🎯 What I Do</h2>
<p style="margin-bottom: 16px;">
  I specialize in creating interactive web applications and immersive user experiences. My passion lies in:
</p>
<ul style="margin-bottom: 16px;">
  <li>🌐 <strong>Web Development:</strong> Building responsive and performant web applications</li>
  <li>🎮 <strong>Interactive Experiences:</strong> Creating engaging 3D web experiences</li>
  <li>📱 <strong>UI/UX Design:</strong> Designing intuitive and beautiful user interfaces</li>
  <li>⚡ <strong>Performance Optimization:</strong> Making web apps fast and efficient</li>
</ul>

<h2 style="color: #34495e; margin-top: 24px; margin-bottom: 12px;">🏆 Featured Projects</h2>
<p style="margin-bottom: 12px;"><strong>ChkhiroOS (This Project)</strong></p>
<p style="margin-bottom: 16px;">
  A fully functional operating system simulation built with React, featuring window management, 
  taskbar functionality, and various applications including this text editor!
</p>

<p style="margin-bottom: 12px;"><strong>3D Portfolio Website</strong></p>
<p style="margin-bottom: 16px;">
  An interactive 3D portfolio showcasing my work using Three.js and React Three Fiber.
</p>

<h2 style="color: #34495e; margin-top: 24px; margin-bottom: 12px;">🌱 Always Learning</h2>
<p style="margin-bottom: 16px;">
  I'm constantly exploring new technologies and improving my skills. Currently interested in:
</p>
<ul style="margin-bottom: 16px;">
  <li>🤖 AI and Machine Learning integration in web apps</li>
  <li>🔥 Advanced React patterns and performance optimization</li>
  <li>🎨 WebGL and advanced 3D graphics</li>
  <li>📚 System design and architecture</li>
</ul>

<h2 style="color: #34495e; margin-top: 24px; margin-bottom: 12px;">📫 Let's Connect!</h2>
<p style="margin-bottom: 16px;">
  I'm always excited to collaborate on interesting projects and meet fellow developers. 
  Feel free to reach out if you'd like to work together or just chat about technology!
</p>

<p style="margin-bottom: 16px;">
  <strong>Email:</strong> beka.chkhirodze@example.com<br>
  <strong>GitHub:</strong> github.com/bekachkhirodze<br>
  <strong>LinkedIn:</strong> linkedin.com/in/bekachkhirodze
</p>

<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">

<p style="text-align: center; color: #7f8c8d; font-style: italic;">
  "Code is poetry written in logic" 💫
</p>
`;

export const AboutMe: React.FC = () => {
  return (
    <TextEditor 
      initialContent={aboutMeContent}
      readOnly={false}
      title="About Me - Beka Chkhirodze"
    />
  );
};