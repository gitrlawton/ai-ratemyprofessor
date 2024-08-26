import { useState } from 'react';
import { Box, TextField, Button, Typography, createTheme, ThemeProvider } from '@mui/material';

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

function SubmitReviewPageForm() {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_AWS_LAMBDA_GATEWAY_API, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ url: url }),
      });
      const data = await response.json();
      console.log('Scraped Data:', data);
    } 
    catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          bgcolor: theme.palette.background.default,
          gap: 2, // Add space between elements
        }}
      >
        <Typography
          variant="body1"
          component="label"
          color={theme.palette.text.secondary}
          sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          Submit a Review:
        </Typography>
        <TextField
          placeholder="Enter RateMyProfessors URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{
            width: '70%',
            flexGrow: 1, // Allow the TextField to grow and fill available space
            '& .MuiInputLabel-root': {
              color: '#7f7f7f',
            },
            '& .MuiInputBase-root': {
              color: '#000000',
              backgroundColor: '#f5f5f5',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#000000',
              },
              '&:hover fieldset': {
                borderColor: '#000000',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#000000',
              },
            },
          }}
        />
        <Button 
          type="submit" 
          variant="contained"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            whiteSpace: 'nowrap', // Prevent button text from wrapping
          }}
        >
          Submit
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default SubmitReviewPageForm;