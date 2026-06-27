import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeafletMap from '../components/LeafletMap';
import { useApp } from '../context/AppContext';

// Mock the AppContext
vi.mock('../context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('LeafletMap Component Tests', () => {
  const mockSetSelectedCity = vi.fn();
  const mockSetSelectedDetailEvent = vi.fn();
  const mockLoadSchoolsForCity = vi.fn();

  const defaultContext = {
    selectedCity: '',
    setSelectedCity: mockSetSelectedCity,
    allEventsRaw: [
      { id: '1', ad: 'Test Event 1', onaylandi: true, il: 'Ankara', enlem: '39.9', boylam: '32.8' },
      { id: '2', ad: 'Test Event 2', onaylandi: false, il: 'Istanbul', enlem: '41.0', boylam: '28.9' }
    ],
    allProjectsRaw: [],
    schoolsData: {},
    loadSchoolsForCity: mockLoadSchoolsForCity,
    setSelectedDetailEvent: mockSetSelectedDetailEvent,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useApp.mockReturnValue(defaultContext);
  });

  it('renders loading spinner and map container', async () => {
    const { container } = render(<LeafletMap />);
    
    // Check loading indicator shows up initially
    expect(screen.getByText(/Harita yükleniyor/i)).toBeInTheDocument();
    
    // Check map container is rendered
    const mapContainer = container.querySelector('#leaflet-map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('renders toolbar buttons and handles clicks after loading', async () => {
    render(<LeafletMap />);

    // Wait until Leaflet loading resolves and LLib is populated
    await waitFor(() => {
      expect(screen.queryByText(/Harita yükleniyor/i)).not.toBeInTheDocument();
    });

    // Verify toolbar controls
    const pinsBtn = screen.getByTitle('Etkinlik pinlerini göster');
    const heatBtn = screen.getByTitle('Isı haritası modunu aç');
    const schoolsBtn = screen.getByTitle('Okulları göster/gizle (il seçiliyken)');
    const resetBtn = screen.getByTitle('Türkiye görünümüne dön');

    expect(pinsBtn).toBeInTheDocument();
    expect(heatBtn).toBeInTheDocument();
    expect(schoolsBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();

    // Default view mode is pins (active class)
    expect(pinsBtn).toHaveClass('active');

    // Click heatmap mode
    fireEvent.click(heatBtn);
    expect(heatBtn).toHaveClass('active');
    expect(pinsBtn).not.toHaveClass('active');

    // Click school toggle
    fireEvent.click(schoolsBtn);
    expect(schoolsBtn).toHaveClass('active');
  });

  it('handles reset view click', async () => {
    render(<LeafletMap />);

    await waitFor(() => {
      expect(screen.queryByText(/Harita yükleniyor/i)).not.toBeInTheDocument();
    });

    const resetBtn = screen.getByTitle('Türkiye görünümüne dön');
    fireEvent.click(resetBtn);

    // reset sets selected city to empty
    expect(mockSetSelectedCity).toHaveBeenCalledWith('');
  });
});
