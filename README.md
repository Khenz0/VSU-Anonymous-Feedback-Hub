# README

## Project Title
DEVELOPMENT OF A WEB-BASED ANONYMOUS STUDENT FEEDBACK BOX APPLICATION FOR THE VISAYAS STATE UNIVERSITY

## Description
This project focuses on developing a web-based anonymous feedback system for Visayas State University. The goal is to create a platform where students can provide honest feedback about courses, instructors, and university services without fear of repercussions. The system aims to foster open communication, improve educational quality, and enhance the overall student experience.

## Background
Feedback plays a crucial role in learning and development, allowing individuals to reflect, improve, and contribute to better educational outcomes. At Visayas State University, students often hesitate to share honest feedback due to concerns about bias and retaliation. Traditional feedback methods, such as manual feedback boxes and the Teacher Performance Evaluation System (TPES), have limitations, including time constraints, lack of anonymity, and difficulty in analyzing responses.

To address these challenges, this project introduces a web-based anonymous feedback system, integrating artificial intelligence (AI) for content moderation and data analysis. The AI component will detect harmful language, filter inappropriate content, and generate analytics to provide meaningful insights for faculty and administrators. By implementing this system, the university can promote inclusivity, encourage constructive dialogue, and ensure continuous improvement in its academic and administrative services.

## Features
- **Anonymous Feedback Submission** - Allows students to submit feedback securely and without revealing their identity.
- **AI-Powered Moderation** - Filters inappropriate content and spam while ensuring feedback remains constructive.
- **Data Analytics** - Provides insights to faculty and administrators for informed decision-making.
- **User-Friendly Interface** - Simple and accessible design for easy navigation.
- **Multi-Department Support** - Enables feedback collection across various university departments beyond academic courses.

## How to Use
Students can use the platform to share their thoughts on courses, instructors, and university services. Faculty and administrators can analyze collected feedback to improve teaching methods, course structures, and campus services.

## Technology Stack
This project is built using **React, TypeScript, and Vite**, providing a modern and efficient development environment with fast refresh capabilities.

### React + TypeScript + Vite
This setup offers a minimal configuration to get React running in Vite with Hot Module Replacement (HMR) and ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh.

### Expanding the ESLint Configuration
If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Author
Khenz0

## Acknowledgments
Special thanks to my thesis adviser and the members of my SRC(Student Research Council) for their guidance and support throughout the development of this project.