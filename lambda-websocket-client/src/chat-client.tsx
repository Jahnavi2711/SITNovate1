import React from 'react';
import { Button, Container, Grid, List, ListItem, ListItemText, Paper } from '@mui/material';

interface ChatClientProps {
  isConnected: boolean;
  members: string[];
  chatRows: React.ReactNode[];
  onPublicMessage: () => void;
  onPrivateMessage: (to: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ChatClient: React.FC<ChatClientProps> = ({
  isConnected,
  members,
  chatRows,
  onPublicMessage,
  onPrivateMessage,
  onConnect,
  onDisconnect
}) => {
  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper style={{ padding: 16, marginTop: 16 }}>
            <h2>WebSocket Chat</h2>
            <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper style={{ padding: 16 }}>
            <h3>Online Members</h3>
            <List>
              {members.map((member, index) => (
                <ListItem key={index} button onClick={() => onPrivateMessage(member)}>
                  <ListItemText primary={member} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={9}>
          <Paper style={{ padding: 16, minHeight: 400, maxHeight: 400, overflow: 'auto' }}>
            {chatRows.map((row, index) => (
              <div key={index} style={{ margin: '8px 0' }}>{row}</div>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper style={{ padding: 16 }}>
            {!isConnected ? (
              <Button variant="contained" color="primary" onClick={onConnect}>
                Connect
              </Button>
            ) : (
              <>
                <Button variant="contained" color="primary" onClick={onPublicMessage} style={{ marginRight: 8 }}>
                  Send Public Message
                </Button>
                <Button variant="contained" color="secondary" onClick={onDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};