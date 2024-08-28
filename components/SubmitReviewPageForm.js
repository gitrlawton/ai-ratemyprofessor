import { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, createTheme, ThemeProvider } from '@mui/material';


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
 const [loading, setLoading] = useState(false);


 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!url.trim()) {
    alert('Please enter a URL before submitting.'); // Show alert if URL is empty
    return;
  }
   setLoading(true); // Start loading


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
     setUrl(''); // Clear the input field
     alert('Link Submitted successfully!'); // Show success alert
   }
   catch (error) {
     console.error('Error:', error); 
     alert('Failed to submit link. Please try again.'); // Show error alert
   }
   finally {
     setLoading(false); // Stop loading
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
        <TextField
          label="Enter RateMyProfessors URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{
            width: '120%',
            flexGrow: 1,
            '& .MuiInputLabel-root': {
              color: '#7f7f7f',
            },
            '& .MuiInputBase-root': {
              color: '#000000',
              backgroundColor: '#f5f5f5',
            },
            '& .MuiOutlinedInput-root': {
              height: '56px', // Adjust height to match the button
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
            height: '56px', // Match the height of the TextField
            bgcolor: theme.palette.primary.main,
            color: theme.palette.text.primary,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center', // Vertically center content
            px: 5, // Horizontal padding for button
          }}
          disabled={loading}
        >
         {loading ? <CircularProgress size={24} sx={{ color: theme.palette.text.primary }} /> : 'Submit'}
       </Button>
     </Box>
   </ThemeProvider>
 );
}


export default SubmitReviewPageForm;
