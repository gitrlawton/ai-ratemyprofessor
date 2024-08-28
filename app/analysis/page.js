'use client'

import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
      primary: {
        main: '#000000', // Black
      },
      secondary: {
        main: '#ffffff', // White
      },
      background: {
        default: '#f5f5f5', // Light Gray for background
      },
      text: {
        primary: '#ffffff', // White text on dark backgrounds
        secondary: '#000000', // Black text on light backgrounds
      },
    },
  });
  
  export default function ProfessorAnalysis() {
    const [professorName, setProfessorName] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setAnalysisResult('');
  
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ professorName }),
        });
  
        const data = await response.text();
        setAnalysisResult(data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setAnalysisResult('An error occurred while fetching the analysis.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <ThemeProvider theme={theme}>
        <Box
          width="100vw"
          height="100vh" // Ensure this allows enough space
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor={theme.palette.background.default}
          p={2}
          overflow="auto" // Ensure content is not cut off
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            color={theme.palette.text.secondary}
            mb={3} // Margin-bottom for spacing
            sx={{ fontWeight: 'bold', mt: '2rem' }}
          >
            Professor Analysis
          </Typography>
  
          <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            width="100%"
            maxWidth="600px" // Max width for better layout
            p={2}
            bgcolor={theme.palette.background.default}
            borderRadius={2}
            boxShadow={2}
          >
            <Stack spacing={2}>
              <TextField
                label="Professor Name"
                variant="outlined"
                fullWidth
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                required
                InputProps={{
                  style: { 
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.text.secondary
                    },
                }}
              />
  
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </Stack>
          </Box>
  
          {analysisResult && (
            <Box
              mt={4}
              width="100%"
              maxWidth="600px"
              p={2}
              bgcolor={theme.palette.secondary.main}
              borderRadius={2}
              boxShadow={2}
            >
              <Typography
                variant="h6"
                component="h2"
                color={theme.palette.text.secondary}
                gutterBottom
              >
                Analysis Result:
              </Typography>
              <Typography
                component="pre"
                color={theme.palette.text.secondary}
                style={{ 
                    whiteSpace: 'pre-wrap' 
                }}
              >
                {analysisResult}
              </Typography>
            </Box>
          )}
        </Box>
      </ThemeProvider>
    );
  }