import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationPanel from '../components/NotificationPanel';
import { useApp } from '../context/AppContext';

// Mock the AppContext
vi.mock('../context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('NotificationPanel Component Tests', () => {
  const mockMarkNotificationAsRead = vi.fn();
  const mockMarkAllNotificationsAsRead = vi.fn();
  const mockDeleteNotification = vi.fn();
  const mockSetActiveTab = vi.fn();
  const mockOnClose = vi.fn();

  const defaultContext = {
    user: { uid: 'user-123', email: 'test@genctek.org' },
    notifications: [
      {
        id: 'n1',
        userId: 'user-123',
        title: 'Yeni Mesaj',
        icerik: 'Ahmet size bir mesaj gönderdi.',
        type: 'message',
        link: 'messages',
        date: '2026-06-14T00:00:00.000Z',
        read: false
      },
      {
        id: 'n2',
        userId: 'user-123',
        title: 'Projeniz Onaylandı',
        icerik: 'Atlas projeniz onaylandı.',
        type: 'project',
        link: 'projects',
        date: '2026-06-13T23:00:00.000Z',
        read: true
      }
    ],
    announcements: [
      {
        id: 'a1',
        baslik: 'Genel Duyuru 1',
        icerik: 'Tüm takımların dikkatine!',
        date: '2026-06-13T22:00:00.000Z',
        authorName: 'Yönetici',
        authorRole: 'admin'
      }
    ],
    markNotificationAsRead: mockMarkNotificationAsRead,
    markAllNotificationsAsRead: mockMarkAllNotificationsAsRead,
    deleteNotification: mockDeleteNotification,
    setActiveTab: mockSetActiveTab
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders NotificationPanel tabs and default notifications list', () => {
    useApp.mockReturnValue(defaultContext);
    render(<NotificationPanel onClose={mockOnClose} />);

    expect(screen.getByText('Bildirim Merkezi')).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByTestId('tab-notifications')).toHaveTextContent('Bildirimler (1)');
    expect(screen.getByTestId('tab-announcements')).toHaveTextContent('Duyurular (1)');

    // Check notifications list
    expect(screen.getByText('Yeni Mesaj')).toBeInTheDocument();
    expect(screen.getByText('Ahmet size bir mesaj gönderdi.')).toBeInTheDocument();
    expect(screen.getByText('Projeniz Onaylandı')).toBeInTheDocument();
  });

  it('handles notification click, marks as read and routes', async () => {
    useApp.mockReturnValue(defaultContext);
    render(<NotificationPanel onClose={mockOnClose} />);

    // Click on unread notification
    const unreadNotif = screen.getByText('Yeni Mesaj');
    fireEvent.click(unreadNotif);

    await vi.waitFor(() => {
      expect(mockMarkNotificationAsRead).toHaveBeenCalledWith('n1');
      expect(mockSetActiveTab).toHaveBeenCalledWith('messages');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('triggers markAllNotificationsAsRead when "Tümünü Oku" button is clicked', () => {
    useApp.mockReturnValue(defaultContext);
    render(<NotificationPanel onClose={mockOnClose} />);

    const markAllBtn = screen.getByTestId('mark-all-read-btn');
    fireEvent.click(markAllBtn);

    expect(mockMarkAllNotificationsAsRead).toHaveBeenCalled();
  });

  it('triggers deleteNotification when trash button is clicked', () => {
    useApp.mockReturnValue(defaultContext);
    render(<NotificationPanel onClose={mockOnClose} />);

    const deleteBtn = screen.getByTestId('delete-notif-n1');
    fireEvent.click(deleteBtn);

    expect(mockDeleteNotification).toHaveBeenCalledWith('n1');
  });

  it('switches to announcements tab and lists announcements', () => {
    useApp.mockReturnValue(defaultContext);
    render(<NotificationPanel onClose={mockOnClose} />);

    const tabAnn = screen.getByTestId('tab-announcements');
    fireEvent.click(tabAnn);

    expect(screen.getByText('Genel Duyuru 1')).toBeInTheDocument();
    expect(screen.getByText('Tüm takımların dikkatine!')).toBeInTheDocument();
    expect(screen.getByText('Yönetici (Yönetici)')).toBeInTheDocument();
    expect(screen.getByText('YENİ')).toBeInTheDocument(); // Unread announcement badge
  });

  it('marks announcement as read locally when clicked', () => {
    useApp.mockReturnValue(defaultContext);
    render(<NotificationPanel onClose={mockOnClose} />);

    // Go to announcements
    fireEvent.click(screen.getByTestId('tab-announcements'));

    // Click announcement
    fireEvent.click(screen.getByText('Genel Duyuru 1'));

    // The state updates local storage
    const readList = JSON.parse(localStorage.getItem('read_announcements') || '[]');
    expect(readList).toContain('a1');
  });

  it('renders empty states correctly', () => {
    useApp.mockReturnValue({
      ...defaultContext,
      notifications: [],
      announcements: []
    });

    render(<NotificationPanel onClose={mockOnClose} />);

    // Notifications tab is empty
    expect(screen.getByTestId('notifications-empty')).toBeInTheDocument();
    expect(screen.getByText('Yeni bir bildiriminiz bulunmuyor.')).toBeInTheDocument();

    // Switch to announcements
    fireEvent.click(screen.getByTestId('tab-announcements'));
    expect(screen.getByTestId('announcements-empty')).toBeInTheDocument();
    expect(screen.getByText('Yayınlanmış bir genel duyuru bulunmuyor.')).toBeInTheDocument();
  });
});
