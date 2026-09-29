<?php
/**
 * RoboThinkLab - School Partnership Inquiry Mailer
 * Compatible with PHP 7.4+ and PHP 8.x
 * Supports direct PHP mail() and PHPMailer
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method Not Allowed"]);
    exit;
}

// Destination email address where inquiries should arrive
$to_email = getenv('RECEIVER_EMAIL') ?: 'robothinklab@gmail.com';

// Read JSON input or fallback to $_POST
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data) {
    $data = $_POST;
}

$first_name  = htmlspecialchars(trim($data['first_name'] ?? ''));
$last_name   = htmlspecialchars(trim($data['last_name'] ?? ''));
$email       = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$school_name = htmlspecialchars(trim($data['school_name'] ?? ''));
$role        = htmlspecialchars(trim($data['role'] ?? ''));
$phone       = htmlspecialchars(trim($data['phone'] ?? ''));
$city        = htmlspecialchars(trim($data['city'] ?? ''));
$state       = htmlspecialchars(trim($data['state'] ?? ''));
$message     = htmlspecialchars(trim($data['message'] ?? ''));

if (empty($first_name) || empty($email) || empty($school_name) || empty($phone)) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Please fill in all required fields (Name, Email, School, Phone)."]);
    exit;
}

$full_name = trim("$first_name $last_name");
$subject = "🚨 New School Partnership Inquiry: $school_name ($full_name)";

// Build HTML email template
$html_body = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New School Inquiry</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 20px; color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 28px;">
    <h2 style="color: #3b82f6; margin-top: 0; font-size: 22px;">RoboThinkLab — Partnership Inquiry</h2>
    <p style="color: #9ca3af; font-size: 14px;">A new school robotics & AI setup inquiry has been submitted:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 15px;">
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 10px 0; color: #9ca3af; width: 35%;">School Name:</td>
        <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">' . $school_name . '</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 10px 0; color: #9ca3af;">Contact Person:</td>
        <td style="padding: 10px 0; color: #ffffff;">' . $full_name . '</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 10px 0; color: #9ca3af;">Designation:</td>
        <td style="padding: 10px 0; color: #ffffff;">' . $role . '</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 10px 0; color: #9ca3af;">Phone:</td>
        <td style="padding: 10px 0; color: #3b82f6; font-weight: bold;"><a href="tel:+91' . $phone . '" style="color: #3b82f6;">+91 ' . $phone . '</a></td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 10px 0; color: #9ca3af;">Email:</td>
        <td style="padding: 10px 0; color: #ffffff;"><a href="mailto:' . $email . '" style="color: #60a5fa;">' . $email . '</a></td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 10px 0; color: #9ca3af;">Location:</td>
        <td style="padding: 10px 0; color: #ffffff;">' . $city . ', ' . $state . '</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; color: #9ca3af; vertical-align: top;">Message:</td>
        <td style="padding: 12px 0; color: #e5e7eb; line-height: 1.6;">' . nl2br($message) . '</td>
      </tr>
    </table>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #6b7280; text-align: center;">
      RoboThinkLab Inquiry System &bull; Direct Lead Delivery
    </div>
  </div>
</body>
</html>
';

// Check if PHPMailer is available via Composer
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            if (getenv('SMTP_HOST')) {
                $mail->isSMTP();
                $mail->Host       = getenv('SMTP_HOST');
                $mail->SMTPAuth   = true;
                $mail->Username   = getenv('SMTP_USER');
                $mail->Password   = getenv('SMTP_PASS');
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = getenv('SMTP_PORT') ?: 587;
            }

            $mail->setFrom(getenv('SMTP_USER') ?: 'leads@robothinklab.com', 'RoboThinkLab Leads');
            $mail->addAddress($to_email);
            $mail->addReplyTo($email, $full_name);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $html_body;
            $mail->AltBody = "New Inquiry:\nSchool: $school_name\nName: $full_name\nPhone: +91 $phone\nEmail: $email\nCity: $city, $state\nMessage: $message";

            $mail->send();
            echo json_encode(["success" => true, "message" => "Inquiry sent successfully via PHPMailer!"]);
            exit;
        } catch (Exception $e) {
            // fallback to mail() below
        }
    }
}

// Fallback to PHP native mail()
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=UTF-8';
$headers[] = 'From: RoboThinkLab Leads <leads@robothinklab.com>';
$headers[] = 'Reply-To: ' . $full_name . ' <' . $email . '>';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail($to_email, $subject, $html_body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(["success" => true, "message" => "Inquiry sent successfully!"]);
} else {
    // If local PHP mail is unconfigured, return clear diagnostic
    echo json_encode([
        "success" => false, 
        "error" => "PHP mail server not configured on this host. Configure SMTP in php.ini or use PHPMailer/Nodemailer."
    ]);
}
