'use client' // This is because page.js is a client component since 
             // we're using state variables.

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SubmitReviewPageForm from "@/components/SubmitReviewPageForm";


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


export default function Home() {
 const router = useRouter();
 const [messages, setMessages] = useState([
   {
     role: 'assistant',
     content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
   },
 ]);
 const [message, setMessage] = useState('');


 const sendMessage = async () => {
   setMessage('');
   setMessages((messages) => [
     ...messages,
     { role: 'user', content: message },
     { role: 'assistant', content: '' },
   ]);


   const response = fetch('/api/chat', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify([...messages, { role: 'user', content: message }]),
   }).then(async (res) => {
     const reader = res.body.getReader();
     const decoder = new TextDecoder();
     let result = '';


     return reader.read().then(function processText({ done, value }) {
       if (done) {
         return result;
       }
       const text = decoder.decode(value || new Uint8Array(), { stream: true });
       setMessages((messages) => {
         let lastMessage = messages[messages.length - 1];
         let otherMessages = messages.slice(0, messages.length - 1);
         return [
           ...otherMessages,
           { ...lastMessage, content: lastMessage.content + text },
          
         ];
       });
      
       return reader.read().then(processText);
     });
   });
 };

 const handleKeyDown = (event) => {
   if (event.key === 'Enter') {
     event.preventDefault(); // Prevents the default action (e.g., form submission)
     sendMessage();
   }
 };

 const handleSearch = () => {
   router.push('/search');
 };

 const handleAnalysis = () => {
  router.push('/analysis');
};

 return (
   <ThemeProvider theme={theme}>
     <Box
       width="100vw"
       height="100vh"
       display="flex"
       flexDirection="column"
       justifyContent="center"
       alignItems="center"
       bgcolor={theme.palette.background.default} // Background color
       p={2} // Padding for better spacing
     >
       <Typography
         variant="h4"
         component="h1"
         gutterBottom
         color={theme.palette.text.secondary}
         mb={3} // Margin-bottom for spacing from chat area
         sx={{ fontWeight: 'bold' }} // Makes the text bold
       >
         Chat about your professor
       </Typography>


       <Stack
         direction={'column'}
         width="100%" // Full width
         height="calc(100% - 128px)" // Full height minus search bar height and heading
         spacing={3}
       >
         <Stack
           direction={'column'}
           spacing={2}
           flexGrow={1}
           overflow="auto"
           maxHeight="100%"
         >
           {messages.map((message, index) => (
             <Box
               key={index}
               display="flex"
               justifyContent={
                 message.role === 'assistant' ? 'flex-start' : 'flex-end'
               }
               sx={{ width: '100%' }}
             >
               <Box
                 bgcolor={
                   message.role === 'assistant'
                     ? theme.palette.primary.main // Black
                     : theme.palette.secondary.main // White
                 }
                 color={message.role === 'assistant' ? theme.palette.text.primary : theme.palette.text.secondary} // Alternate text color
                 borderRadius={16}
                 p={3}
                 maxWidth="75%" // Limiting width of the messages
                 sx={{ wordBreak: 'break-word' }} // Ensure long words break and don't overflow
               >
                 <Typography
                   component="div"
                   style={{ whiteSpace: 'pre-wrap' }}
                 >
                   {message.content}
                 </Typography>
               </Box>
             </Box>
           ))}
         </Stack>


         <Stack direction={'row'} spacing={2}>
           <TextField
             label="Message"
             fullWidth
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             onKeyDown={handleKeyDown}
             sx={{
               '& .MuiInputLabel-root': {
                 color: '#7f7f7f', // Makes the label transparent
               },
               '& .MuiInputBase-root': {
                 color: '#000000',
                 backgroundColor: '#f5f5f5', // Grey background for the message field
               },
               '& .MuiOutlinedInput-root': {
                 '& fieldset': {
                   borderColor: '#000000', // Default border color
                 },
                 '&:hover fieldset': {
                   borderColor: '#000000', // Border color on hover
                 },
                 '&.Mui-focused fieldset': {
                   borderColor: '#000000', // Border color when focused
                 },
               },
             }}
           />
           <Button variant="contained" onClick={sendMessage}>
             Send
           </Button>
         </Stack>
       </Stack>


       <Stack
         direction={'row'}
         spacing={2}
         mt={2} // Margin-top for spacing from chat area
         justifyContent="space-between"
         width="100%"
         
       >
         <SubmitReviewPageForm /> 
         <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            onClick={handleAnalysis}
            sx={{
              whiteSpace: 'normal',  // Allow the text to wrap
              wordWrap: 'break-word', // Break long words if necessary
              textAlign: 'center',   // Center-align the text
              minWidth: '120px'
            }}
            >
            Analyze
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSearch}
            sx={{
              whiteSpace: 'normal',  // Allow the text to wrap
              wordWrap: 'break-word', // Break long words if necessary
              textAlign: 'center',   // Center-align the text
              minWidth: '120px'
            }}
            >
            Search
          </Button>
          </Stack>
       </Stack>
     </Box>
   </ThemeProvider>
 );
}