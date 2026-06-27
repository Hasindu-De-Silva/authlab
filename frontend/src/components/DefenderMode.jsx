import { useState } from 'react'
import { validateDefender } from '../api/challenges'
import { toast } from 'react-hot-toast'
import { Shield, CheckCircle, XCircle, Code, ChevronDown, ChevronUp } from 'lucide-react'

// Vulnerable vs secure code for each challenge
const DEFENDER_DATA = {
  1: {
    vulnerable: `// ❌ VULNERABLE: MD5 password hashing
import java.security.MessageDigest;

public String hashPassword(String password) {
    MessageDigest md = MessageDigest.getInstance("MD5");
    byte[] hash = md.digest(password.getBytes());
    // MD5 is FAST — attackers can crack billions/sec
    return bytesToHex(hash);
}

public boolean login(String username, String password) {
    String storedHash = db.getUserHash(username);
    // Direct MD5 comparison — no salt!
    return hashPassword(password).equals(storedHash);
}`,
    secure: `// ✅ SECURE: bcrypt password hashing
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

public String hashPassword(String password) {
    // bcrypt is SLOW by design — 12 rounds
    // Auto-generates a unique salt per password
    return encoder.encode(password);
}

public boolean login(String username, String password) {
    String storedHash = db.getUserHash(username);
    // Timing-safe comparison — prevents timing attacks
    return encoder.matches(password, storedHash);
}`,
    placeholder: `// Fix the hash function to use bcrypt instead of MD5
// Hint: Use BCryptPasswordEncoder with cost factor 12
public String hashPassword(String password) {
    // Your code here...
}`,
    explanation: 'MD5 produces the same hash for the same input (no salt) and runs in nanoseconds. Attackers use precomputed rainbow tables or GPU farms to crack millions of MD5 hashes per second. bcrypt is specifically designed to be slow and includes a random salt automatically.',
  },
  2: {
    vulnerable: `// ❌ VULNERABLE: No rate limiting
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    // No attempt tracking!
    // No lockout!
    // No delay!
    User user = userRepo.findByUsername(req.getUsername());
    if (user != null && user.getPassword().equals(req.getPassword())) {
        return ResponseEntity.ok(generateToken(user));
    }
    return ResponseEntity.status(401).body("Invalid credentials");
}`,
    secure: `// ✅ SECURE: Rate limiting with lockout
@PostMapping("/login")
@RateLimiter(name = "loginLimiter", fallbackMethod = "rateLimitFallback")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    String key = req.getUsername() + ":" + getClientIp(req);
    int attempts = attemptCache.getOrDefault(key, 0);
    
    if (attempts >= 5) {
        long lockoutMs = attemptCache.getLockoutTime(key);
        return ResponseEntity.status(429)
            .body("Account locked. Try again in " + lockoutMs/1000 + "s");
    }
    
    User user = userRepo.findByUsername(req.getUsername());
    if (user != null && bcrypt.matches(req.getPassword(), user.getHash())) {
        attemptCache.reset(key);
        return ResponseEntity.ok(generateToken(user));
    }
    
    attemptCache.increment(key);
    Thread.sleep(500 * attempts); // Increasing delay
    return ResponseEntity.status(401).body("Invalid credentials");
}`,
    placeholder: `// Add rate limiting to this login endpoint
// Hint: Track failed attempts per username/IP, lockout after 5 fails
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    // Add your rate limiting logic here...
}`,
    explanation: 'Without rate limiting, an attacker can try thousands of passwords per second automatically. Modern systems implement: (1) Attempt counting per username+IP, (2) Progressive delays, (3) Temporary lockouts after N failures, (4) CAPTCHA after suspicious activity.',
  },
  3: {
    vulnerable: `// ❌ VULNERABLE: Weak JWT secret
@Value("\${jwt.secret:secret123}")  // Hardcoded weak secret!
private String jwtSecret;

public String generateToken(User user) {
    return Jwts.builder()
        .setSubject(user.getUsername())
        .claim("role", user.getRole())
        .signWith(SignatureAlgorithm.HS256, jwtSecret)  // HS256 + weak key
        .compact();
}

public Claims validateToken(String token) {
    // No expiry check!
    return Jwts.parser()
        .setSigningKey(jwtSecret)
        .parseClaimsJws(token)
        .getBody();
}`,
    secure: `// ✅ SECURE: Strong JWT with RS256
import java.security.KeyPair;
import java.security.KeyPairGenerator;

// Generate RSA key pair (2048-bit) — never hardcode secrets
private KeyPair keyPair = generateKeyPair();

public String generateToken(User user) {
    return Jwts.builder()
        .setSubject(user.getUsername())
        .claim("role", user.getRole())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 3600_000)) // 1hr
        .signWith(keyPair.getPrivate(), SignatureAlgorithm.RS256) // Asymmetric!
        .compact();
}

public Claims validateToken(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(keyPair.getPublic()) // Verify with PUBLIC key
        .requireExpiration()               // Enforce expiry!
        .build()
        .parseClaimsJws(token)
        .getBody();
}`,
    placeholder: `// Fix the JWT implementation
// Hint 1: Use RS256 with a generated RSA key pair instead of HS256 + secret
// Hint 2: Add token expiration (1 hour)
public String generateToken(User user) {
    // Your secure implementation...
}`,
    explanation: 'HS256 with a weak secret like "secret123" can be brute-forced offline. Anyone who gets the secret can forge tokens with any payload (e.g., role: "admin"). RS256 uses asymmetric keys — even if the public key is exposed, only the private key can sign tokens.',
  },
  4: {
    vulnerable: `// ❌ VULNERABLE: Predictable OTP
public String generateOtp(String userId) {
    // OTP based purely on current time — PREDICTABLE!
    long timestamp = System.currentTimeMillis() / 1000;
    int otp = (int)(timestamp / 30) % 1_000_000;
    return String.format("%06d", otp);
}

public boolean verifyOtp(String userId, String inputOtp) {
    String expected = generateOtp(userId);
    return expected.equals(inputOtp);  // No user binding!
}`,
    secure: `// ✅ SECURE: TOTP with per-user secret (RFC 6238)
import dev.samstevens.totp.code.*;
import dev.samstevens.totp.secret.DefaultSecretGenerator;

private SecretGenerator secretGenerator = new DefaultSecretGenerator(32);
private CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1, 6);
private CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, new SystemTimeProvider());

public String generateUserSecret(String userId) {
    String secret = secretGenerator.generate(); // 160-bit random secret per user
    db.saveOtpSecret(userId, encrypt(secret));   // Encrypted at rest
    return secret; // QR code delivery via authenticator app
}

public boolean verifyOtp(String userId, String inputOtp) {
    String secret = decrypt(db.getOtpSecret(userId));
    // Allows 1 time-step window (±30s) for clock drift
    return verifier.isValidCode(secret, inputOtp);
}`,
    placeholder: `// Fix the OTP generator to use per-user TOTP secrets
// Hint: Each user should have a unique random secret stored in DB
public boolean verifyOtp(String userId, String inputOtp) {
    // Your secure TOTP implementation...
}`,
    explanation: 'Time-based OTPs derived purely from the current timestamp are globally predictable — any attacker who knows the algorithm can compute the current OTP. RFC 6238 TOTP uses a unique per-user secret key combined with the timestamp, so even knowing the algorithm reveals nothing without the secret.',
  },
  5: {
    vulnerable: `// ❌ VULNERABLE: Insecure session cookie
@PostMapping("/login")
public ResponseEntity<?> login(HttpServletResponse response, ...) {
    String sessionId = UUID.randomUUID().toString();
    db.saveSession(sessionId, user.getId());
    
    Cookie cookie = new Cookie("SESSION", sessionId);
    cookie.setPath("/");
    // Missing: HttpOnly, Secure, SameSite!
    // JS can read this cookie — XSS = full account takeover
    response.addCookie(cookie);
    return ResponseEntity.ok("Logged in");
}`,
    secure: `// ✅ SECURE: Hardened session cookie
@PostMapping("/login")
public ResponseEntity<?> login(HttpServletResponse response, ...) {
    String sessionId = generateSecureSessionId(); // 256-bit random
    db.saveSession(sessionId, user.getId(), getExpiryTime());
    
    ResponseCookie cookie = ResponseCookie.from("SESSION", sessionId)
        .httpOnly(true)      // No JS access — blocks XSS theft
        .secure(true)        // HTTPS only — blocks network sniffing
        .sameSite("Strict")  // CSRF protection
        .path("/")
        .maxAge(Duration.ofHours(1))
        .build();
    
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    return ResponseEntity.ok("Logged in");
}

private String generateSecureSessionId() {
    byte[] bytes = new byte[32]; // 256-bit
    new SecureRandom().nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
}`,
    placeholder: `// Fix the cookie to include security flags
// Hint: Add HttpOnly, Secure, and SameSite=Strict flags
Cookie cookie = new Cookie("SESSION", sessionId);
// Add security flags here...
response.addCookie(cookie);`,
    explanation: 'Without HttpOnly, JavaScript can read the session cookie — a single XSS vulnerability lets attackers steal every active session. Without Secure, the cookie travels over HTTP in cleartext. Without SameSite=Strict, CSRF attacks can use the victim\'s cookie. All three flags are required.',
  },
}

function CodeBlock({ title, code, color, colorRgb }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid rgba(${colorRgb},0.2)` }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: `rgba(${colorRgb},0.06)`, borderBottom: `1px solid rgba(${colorRgb},0.15)` }}>
        <span className="text-xs font-mono font-semibold" style={{ color }}>
          {title}
        </span>
        <button onClick={copy} className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-xs text-gray-300 font-mono leading-relaxed overflow-auto code-scroll max-h-64 bg-dark-bg/50">
        {code}
      </pre>
    </div>
  )
}

export default function DefenderMode({ challenge }) {
  const data = DEFENDER_DATA[challenge.id]
  const [userCode, setUserCode] = useState(data?.placeholder || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleValidate = async () => {
    setLoading(true)
    try {
      const res = await validateDefender(challenge.id, userCode)
      setResult(res.data)
      if (res.data.correct) {
        toast.success('✅ Great fix! Code is now secure.')
      } else {
        toast.error('Not quite right. Check the hints.')
      }
    } catch (err) {
      const errData = err.response?.data
      setResult({ correct: false, feedback: errData?.feedback || 'Server error. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!data) return (
    <div className="glass-card rounded-xl p-8 text-center text-gray-500 font-mono">
      Defender mode coming soon for this challenge.
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Mode banner */}
      <div className="glass-card neon-border-purple rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-neon-purple flex-shrink-0" />
        <div>
          <div className="text-white font-semibold font-mono text-sm">Defender Mode</div>
          <div className="text-gray-500 text-xs mt-0.5">
            Study the vulnerability, then fix the vulnerable code below.
          </div>
        </div>
      </div>

      {/* Side-by-side code comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <CodeBlock
          title="❌ Vulnerable Code"
          code={data.vulnerable}
          color="#ff4444"
          colorRgb="255,68,68"
        />
        <CodeBlock
          title="✅ Secure Version"
          code={data.secure}
          color="#00ff88"
          colorRgb="0,255,136"
        />
      </div>

      {/* User's fix */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
          <span className="text-sm font-mono text-neon-blue flex items-center gap-2">
            <Code className="w-4 h-4" />
            Your Fix
          </span>
          <button
            onClick={() => setUserCode(data.placeholder)}
            className="text-xs font-mono text-gray-600 hover:text-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>
        <textarea
          className="w-full bg-transparent p-4 font-mono text-sm text-gray-300 outline-none resize-none h-48 code-scroll"
          value={userCode}
          onChange={e => setUserCode(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Validate button */}
      <button
        onClick={handleValidate}
        disabled={loading}
        className="w-full btn-solid-green py-3 rounded-xl flex items-center justify-center gap-2 font-mono font-bold transition-all"
        style={{ background: '#a855f7', color: 'white' }}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Validating...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            Check My Fix
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className={`glass-card rounded-xl p-4 ${
          result.correct ? 'neon-border-green' : 'neon-border-red'
        }`}>
          <div className={`flex items-center gap-2 font-mono text-sm font-bold mb-2 ${
            result.correct ? 'text-neon-green' : 'text-red-400'
          }`}>
            {result.correct
              ? <><CheckCircle className="w-4 h-4" />Correct! Your fix is secure.</>
              : <><XCircle className="w-4 h-4" />Not quite right.</>
            }
          </div>
          <p className="text-gray-400 text-sm font-mono leading-relaxed">{result.feedback}</p>
        </div>
      )}

      {/* Explanation */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          <span className="text-sm font-mono text-gray-300 flex items-center gap-2">
            📖 Why is this vulnerable?
          </span>
          {showExplanation ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {showExplanation && (
          <div className="border-t border-dark-border p-4">
            <p className="text-gray-400 text-sm leading-relaxed font-mono">{data.explanation}</p>
          </div>
        )}
      </div>
    </div>
  )
}
