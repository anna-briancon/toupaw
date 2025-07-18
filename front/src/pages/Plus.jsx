import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  Settings,
  Users,
  Camera,
  Heart,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Dog,
  Cat,
  PawPrint,
  Share2,
  Eye,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import SectionTitle from '../components/SectionTitle';
import InviteUser from "../components/InviteUser";
import PetMembers from "../components/PetMembers";
import axios from "../utils/axiosInstance";

// Card component
function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl border bg-white ${className}`} {...props}>{children}</div>
  );
}
function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>{children}</div>
  );
}
// Button component
function Button({ variant = "solid", className = "", children, ...props }) {
  let base =
    "inline-flex items-center justify-center font-semibold rounded-lg px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-emerald-400";
  let variants = {
    solid:
      "bg-emerald-600 text-white hover:bg-emerald-700",
    outline:
      "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent",
    ghost:
      "bg-transparent text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function SectionCard({ icon, title, description, onClick }) {
  return (
    <Card className="mb-4 hover:shadow-md transition-all duration-200 cursor-pointer border-emerald-100" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl text-emerald-600">{icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-base text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-emerald-500" />
        </div>
      </CardContent>
    </Card>
  );
}

function AdviceSection({ onClick }) {
  return (
    <SectionCard
      icon={<Lightbulb className="h-6 w-6" />}
      title="Conseils bien-être & éducation"
      description="Astuces, guides et ressources pour ton animal."
      onClick={onClick}
    />
  );
}
function SettingsSection({ onClick }) {
  return (
    <SectionCard
      icon={<Settings className="h-6 w-6" />}
      title="Paramètres du compte"
      description="Gérer ton profil."
      onClick={onClick}
    />
  );
}
function MultiPetsSection({ onClick }) {
  return (
    <SectionCard
      icon={<Users className="h-6 w-6" />}
      title="Multi-animaux"
      description="Voir, ajouter ou gérer d'autres animaux."
      onClick={onClick}
    />
  );
}
function GallerySection({ onClick }) {
  return (
    <SectionCard
      icon={<Camera className="h-6 w-6" />}
      title="Galerie souvenirs"
      description="Voir toutes les photos et souvenirs."
      onClick={onClick}
    />
  );
}
function SupportSection({ onClick }) {
  return (
    <SectionCard
      icon={<HelpCircle className="h-6 w-6" />}
      title="Aide & Support"
      description="FAQ, contact support, signaler un problème."
      onClick={onClick}
    />
  );
}
function NotificationsSection({ onClick }) {
  return (
    <SectionCard
      icon={<Bell className="h-6 w-6" />}
      title="Notifications"
      description="Gérer les rappels et alertes."
      onClick={onClick}
    />
  );
}
function PrivacySection({ onClick }) {
  return (
    <SectionCard
      icon={<Shield className="h-6 w-6" />}
      title="Confidentialité & Sécurité"
      description="Paramètres de confidentialité et sécurité."
      onClick={onClick}
    />
  );
}

export default function Plus() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleAdviceClick = () => {
    navigate('/advice');
  };
  const handleSettingsClick = () => {
    navigate('/account-settings');
  };
  const handleMultiPetsClick = () => {
    navigate('/multi-pets');
  };
  const handleGalleryClick = () => {
    alert("Fonctionnalité à venir : Galerie de photos");
  };
  const handleSupportClick = () => {
    navigate('/faq-support');
  };
  const handleNotificationsClick = () => {
    alert("Fonctionnalité à venir : Paramètres de notifications");
  };
  const handlePrivacyClick = () => {
    alert("Fonctionnalité à venir : Paramètres de confidentialité");
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Toupaw",
        text: "Découvre Toupaw, l'app pour gérer le bien-être de ton animal !",
        url: window.location.origin,
      }).catch((error) => {
        // Optionnel : gérer l'annulation ou l'erreur
        console.log("Erreur lors du partage :", error);
      });
    } else {
      alert("La fonctionnalité de partage n'est pas supportée sur cet appareil.");
    }
  };

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [showMembersPetId, setShowMembersPetId] = useState(null);

  useEffect(() => {
    // Récupère la liste des animaux de l'utilisateur connecté
    const fetchPets = async () => {
      try {
        console.log("Token utilisé :", localStorage.getItem('token'));
        const res = await axios.get("/pets");
        setPets(res.data);
      } catch (err) {
        setPets([]);
      }
    };
    fetchPets();
  }, []);

  return (
    <div className="min-h-screen bg-couleur-fond p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <SectionTitle className="mb-0">Plus</SectionTitle>
          <Button
            variant="solid"
            className="bg-red-100 !text-red-800 border border-red-300 hover:bg-red-200 px-5 py-2 rounded-xl text-base font-bold flex items-center gap-2 shadow-none"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2 text-red-800 " />
            Déconnexion
          </Button>
        </div>
        {/* Sections principales */}
        <div className="space-y-2 mb-8">
          <h2 className="font-ranille text-base font-semibold text-gray-900 mb-4">Fonctionnalités</h2>
          <AdviceSection onClick={handleAdviceClick} />
          <MultiPetsSection onClick={handleMultiPetsClick} />
          {/* <GallerySection onClick={handleGalleryClick} /> */}
        </div>
        {/* Paramètres */}
        <div className="space-y-2 mb-8">
          <h2 className="font-ranille text-base font-semibold text-gray-900 mb-4">Paramètres</h2>
          <SettingsSection onClick={handleSettingsClick} />
          {/* <NotificationsSection onClick={handleNotificationsClick} /> */}
          {/* <PrivacySection onClick={handlePrivacyClick} /> */}
        </div>
        {/* Support */}
        <div className="space-y-2 mb-8">
          <h2 className="font-ranille text-base font-semibold text-gray-900 mb-4">Aide</h2>
          <SupportSection onClick={handleSupportClick} />
        </div>
        {/* Informations de l'app */}
        {/* <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">Toupaw</span>
            </div>
            <p className="text-base font-semibold text-emerald-700 mb-1">Gérez le bien-être de vos animaux en famille ou entre amis</p>
            <p className="text-sm text-gray-600 mb-2">L'application collaborative pour suivre, partager et chouchouter vos compagnons à quatre pattes.</p>
            <p className="text-xs text-gray-500 mb-2">Version 1.0.0</p>
            Optionnel : nombre d'animaux gérés si tu veux l'afficher
            <p className="text-xs text-gray-500 mb-2">{pets.length} animaux gérés</p>
           
            <p className="text-xs text-gray-500">Fait avec ❤️ par la communauté Toupaw</p>
            <div className="mt-3">
              <a href="/faq-support" className="text-emerald-600 hover:underline text-xs">Besoin d'aide ? FAQ & Support</a>
            </div>
          </CardContent>
        </Card> */}
        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            onClick={handleShare}
          >
            Partager l'app
          </Button>
          {/* <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            onClick={() => alert("Fonctionnalité à venir : Noter l'app")}
          >
            Noter l'app
          </Button> */}
        </div>
      </div>
    </div>
  );
} 