import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessagingHub from '../components/MessagingHub';
import { useApp } from '../context/AppContext';

// Mock the AppContext
vi.mock('../context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('MessagingHub Component Tests', () => {
  const mockSendDirectMessage = vi.fn();
  const mockMarkMessagesAsRead = vi.fn();
  const mockFetchDirectMessages = vi.fn();

  const defaultContext = {
    user: { uid: 'my-uid', email: 'test@genctek.org' },
    userRole: 'student',
    directMessages: [
      { id: 'm1', senderId: 'partner-uid', senderName: 'Partner User', senderRole: 'coordinator', receiverId: 'my-uid', receiverName: 'Test Student', receiverRole: 'student', mesaj: 'Hello student!', tarih: '2026-06-13T12:00:00.000Z', okundu: false }
    ],
    chatContacts: [
      { uid: 'partner-uid', adSoyad: 'Partner User', role: 'coordinator', eposta: 'partner@genctek.org', il: 'Ankara' }
    ],
    sendDirectMessage: mockSendDirectMessage,
    markMessagesAsRead: mockMarkMessagesAsRead,
    fetchDirectMessages: mockFetchDirectMessages,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login required state when user is null', () => {
    useApp.mockReturnValue({
      user: null,
      userRole: null,
      directMessages: [],
      chatContacts: [],
      sendDirectMessage: mockSendDirectMessage,
      markMessagesAsRead: mockMarkMessagesAsRead,
      fetchDirectMessages: mockFetchDirectMessages,
    });

    render(<MessagingHub />);
    expect(screen.getByText(/Giriş Yapılması Gerekli/i)).toBeInTheDocument();
  });

  it('renders conversation lists and new chat modal triggers when logged in', async () => {
    useApp.mockReturnValue(defaultContext);
    render(<MessagingHub />);

    // Check panel headers
    expect(screen.getByRole('heading', { name: /Mesajlar/i })).toBeInTheDocument();
    
    // Check conversation partner is listed
    expect(screen.getByText('Partner User')).toBeInTheDocument();
    expect(screen.getAllByText('Hello student!')[0]).toBeInTheDocument();
    
    // Unread count badge is rendered
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 unread msg badge

    // Click on active chat item to open chat window
    fireEvent.click(screen.getByText('Partner User'));

    // Chat header displays partner name
    expect(screen.getByText('İl Koordinatörü')).toBeInTheDocument();
    
    // Check message history displays
    expect(screen.getAllByText('Hello student!').length).toBeGreaterThanOrEqual(1);

    // Verify markMessagesAsRead was triggered
    expect(mockMarkMessagesAsRead).toHaveBeenCalledWith('partner-uid');

    // Input form is visible
    const input = screen.getByPlaceholderText('Mesajınızı yazın...');
    expect(input).toBeInTheDocument();

    // Send a message
    fireEvent.change(input, { target: { value: 'Hi coordinator!' } });
    fireEvent.submit(input.closest('form'));

    expect(mockSendDirectMessage).toHaveBeenCalledWith('partner-uid', 'Partner User', 'coordinator', 'Hi coordinator!');
  });

  it('opens and closes NewConversationModal on button clicks', () => {
    useApp.mockReturnValue(defaultContext);
    render(<MessagingHub />);

    const newChatBtn = screen.getByText('Yeni Sohbet');
    fireEvent.click(newChatBtn);

    // Modal title is rendered
    expect(screen.getByText('Yeni Sohbet Başlat')).toBeInTheDocument();

    // Close modal using close button
    const modalHeading = screen.getByText('Yeni Sohbet Başlat');
    const modalCloseBtn = modalHeading.nextSibling;
    fireEvent.click(modalCloseBtn);

    expect(screen.queryByText('Yeni Sohbet Başlat')).not.toBeInTheDocument();
  });
});
