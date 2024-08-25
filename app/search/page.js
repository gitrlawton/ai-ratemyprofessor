'use client'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Stack, TextField, Typography, Card, CardContent, Container, CircularProgress } from '@mui/material';
import { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';


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


export default function Search() {
 const [course, setCourse] = useState('');
 const [difficulty, setDifficulty] = useState('');
 const [profName, setProfName] = useState('');
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');


 const handleSubmit = async (event) => {
   event.preventDefault();
   setLoading(true);
   setError('');
   setResults([]);
  
   let searchParams = {
    professorName: profName || undefined,
    course: course || undefined,
    difficulty: difficulty || undefined,
  };
  console.log('Search params:', searchParams);

  let query = `
  Provide ONLY the reviews that satisfy ALL the following criteria,
 
  ${profName ? `Professor Name: ${profName}` : ''}
  ${course ? `Course: ${course}` : ''}
  ${difficulty ? `Difficulty: ${difficulty}` : ''}




  Please return the results in the following JSON format:
  [
    {
      "name": " ",
      "course": " ",
      "rating": " ",
      "review": " ",
      "difficulty": " "
    },
    ...
  ]
`;

  if (!profName && !course && !difficulty) {
   setError('Please provide at least one search criterion.');
   setLoading(false);
   return;
 }
  
 
  
   try {
     const response = await fetch('/api/chat', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify([{ role: 'user', content: query, params: searchParams }]),
     });


     if (!response.ok) {
       throw new Error('Network response was not ok');
     }


     const reader = response.body.getReader();
     const decoder = new TextDecoder();
     let result = '';
    
     const processText = async () => {
       const { done, value } = await reader.read();
       if (done) {
         return result;
       }
       result += decoder.decode(value || new Uint8Array(), { stream: true });
      
       return processText();
     };
    
     await processText();
    
     const parsedResults = parseResults(result);
    
     setResults(parsedResults);
    
   } catch (err) {
     setError('Failed to fetch results. Please try again later.');
   } finally {
     setLoading(false);
   }
 };



  const parseResults = (resultString) => {
   try {
     console.log("Results:", resultString);
          const cleanedString = resultString
       .replace(/```json/g, '')   // Remove starting code block delimiter
       .replace(/```/g, '')       // Remove ending code block delimiter
       .trim();                   // Trim extra spaces
           const results = [];
    
     // Regular expression to match each entry
     const regex = /"name": "(.*?)",\s*"course": "(.*?)",\s*"rating": "(.*?)",\s*"review": "(.*?)"/g;
     let match;
    
     // Loop through all matches
     while ((match = regex.exec(cleanedString)) !== null) {
       results.push({
         name: match[1],
         course: match[2],
         rating: match[3],
         review: match[4]
       });
     }


     // Log the results to verify
     console.log("Parsed Results:", results);
      return results;
   } catch (error) {
     console.error("Error parsing results:", error);
     return [];
   }
 };
 const renderStars = (rating) => {
  const stars = parseInt(rating, 10); // Convert rating to integer
  const color = stars < 3 ? 'error' : 'success'; // Red for less than 3, green for 3 or more

  return (
    <Stack direction="row" spacing={0.5}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          color={index < stars ? color : 'action'} // Fill color based on rating
        />
      ))}
    </Stack>
  );
};


 
 return (
   <ThemeProvider theme={theme}>
     <Container
       maxWidth={false}
       sx={{
         minHeight: '100vh',
         p: 3,
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         bgcolor: (theme) => theme.palette.background.default,
       }}
     >
       <Typography
         variant="h4"
         component="h1"
         gutterBottom
         sx={{ color: (theme) => theme.palette.text.secondary, mb: 3, fontWeight: 'bold' }}
       >
         Search Professors
       </Typography>


       <Stack
         direction="column"
         spacing={3}
         borderRadius={2}
         width="100%"
         mb={4}
       >
         <Stack
           direction="row"
           spacing={2}
         >
           <TextField
             label="Professor Name"
             fullWidth
             value={profName}
             onChange={(e) => setProfName(e.target.value)}
             sx={{
               '& .MuiInputLabel-root': {
                 color: '#7f7f7f', // Makes the label transparent
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
           <TextField
             label="course"
             fullWidth
             value={course}
             onChange={(e) => setCourse(e.target.value)}
             sx={{
               '& .MuiInputLabel-root': {
                 color: '#7f7f7f', // Makes the label transparent
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
           <TextField
             label="Difficulty"
             fullWidth
             value={difficulty}
             onChange={(e) => setDifficulty(e.target.value)}
             sx={{
               '& .MuiInputLabel-root': {
                 color: '#7f7f7f', // Makes the label transparent
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
         </Stack>


         <Stack
           direction="row"
           justifyContent="center"
         >
           <Button
             variant="contained"
             onClick={handleSubmit}
           >
             Search
           </Button>
         </Stack>
       </Stack>


       {loading && <CircularProgress color="primary" />}
       {error && <Typography color="error">{error}</Typography>}
       <Stack direction="column" spacing={2} width="100%">
         {!loading && !error && results.length > 0 ? (
           results.map((result, index) => (
             <Card
               key={index}
               sx={{
                 borderRadius: '12px',
                 boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                 backgroundColor: '#f5f5f5',
                 height: "auto",
                 position: 'relative',
                 display: 'flex',
                 width: '100%',
                 padding: 2,
               }}
             >
               <CardContent >
               <Typography
       variant="h6"
       sx={{ color: '#333', fontWeight: 'bold' }} // Bold professor name
     >
       {result.name}
     </Typography>
     <Typography
       sx={{ color: '#333', mt: 1, fontSize: '1.2rem' }} // Larger font size for course
     >
       {result.course}
     </Typography>
     <Typography sx={{ color: '#333', mt: 1 }}>
       {renderStars(result.rating)}
     </Typography>
     <Typography
       sx={{ color: '#333', mt: 1, fontStyle: 'italic' }} // Italic for review
     >
       {result.review}
     </Typography>
               </CardContent>
             </Card>
           ))
         ) : (
           !loading && !error && <Typography sx={{ textAlign: "center" }}>No results found</Typography>
         )}
       </Stack>
     </Container>
   </ThemeProvider>
 );
}     
