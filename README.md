# Rate My Professor AI Assistant

## Overview

This project is a web application that allows users to search for professor reviews and analyze their sentiments using AI. Built with Next.js and Material-UI, the application provides a user-friendly interface for students to interact with professor data, submit URLs for scraping, and receive analysis on professor performance based on reviews.

## Features

- **Professor Search**: Users can search for professors by name, course, and difficulty level to retrieve relevant reviews.
- **Review Submission**: Users can submit URLs from RateMyProfessors for scraping and analysis.
- **Sentiment Analysis**: The application utilizes OpenAI's language model to analyze and summarize professor reviews, providing insights into teaching effectiveness and student sentiment.
- **Responsive Design**: Built with Material-UI, the application is responsive and provides a seamless user experience across devices.

## Installation

To set up the project, ensure you have Node.js installed on your machine. Then, follow these steps:

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the required packages:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your API keys:
   ```plaintext
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   NEXT_PUBLIC_AWS_LAMBDA_GATEWAY_API=https://your_api_endpoint
   ```

## Usage

1. Run the Next.js application:

   ```bash
   npm run dev
   ```

2. Open your web browser and navigate to `http://localhost:3000`.

3. Use the search functionality to find professors or submit a URL for scraping.

4. View the analysis results and professor reviews directly in the application.

## File Descriptions

- **app/page.js**: The main entry point of the application, handling user interactions and rendering components.
- **app/components/SubmitReviewPageForm.js**: A component for submitting URLs to scrape reviews from RateMyProfessors.
- **app/api/chat/route.js**: API route for handling chat interactions and generating responses based on user queries.
- **app/api/analyze/route.js**: API route for analyzing professor reviews and generating sentiment summaries.
- **app/search/page.js**: The search page where users can input criteria to find professor reviews.

## Dependencies

- **Next.js**: For server-side rendering and building the application.
- **Material-UI**: For UI components and styling.
- **OpenAI**: For AI-driven analysis and responses.
- **Pinecone**: For managing and querying vector embeddings of reviews.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.
