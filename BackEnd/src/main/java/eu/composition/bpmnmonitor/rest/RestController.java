package eu.composition.bpmnmonitor.rest;

import com.google.gson.Gson;
import eu.composition.bpmnmonitor.processhandling.BackEnd;

import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import spark.Route;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RestController {

    private static Gson gson = new Gson();
    private static BackEnd be = new BackEnd();

    /**
     * Get the BPMN model stored in this application. If no BPMN model has been
     * saved previously, an empty string will return.
     *
     * @return A Route object, which returns a string representing the BPMN model as XML string
     */
    public static Route getLocalBpmn() {
        return (req, res) -> {
            return be.getBpmnModel();
        };

    }

    /**
     * Post a BPMN model to this application. The BPMN model will then be stored.
     * After that, if getLocalBpmn() is used, the saved model will be returned.
     *
     * @return A Route object
     */
    public static Route setLocalBpmn() {
        return (req, res) -> {
            // TODO: verify body before putting in
            be.setBpmnModel(req.body());
            return "";
        };

    }

    /**
     * Get the list of BPMN from DFM.
     *
     * @return A Route object, which returns a JSON string representing the list of models in DFM
     */
    public static Route getRemoteBpmnList(final String dfmEndpoint) {
        return (req, res) -> {

            // Hard-coded the list for the moment
            return "[{ \"name\": \"Process_1\" }, { \"name\": \"Process_2\" }, { \"name\": \"Process_3\" }]";

        };

    }

    /**
     * Get the BPMN model from the DFM, specified by the URL parameter 'id'.
     *
     * @return A Route, which returns the BPMN model as a XML string
     */
    public static Route getRemoteBpmn(final String dfmEndpoint) {
        return (req, res) -> {
            String url = dfmEndpoint
                    + "/getBPMN?factoryID=BSL_ID"
                    + "&bpmnID=" + req.params(":id");

            String p = sendGet(url);
            String model = StringUtils.substringBetween(p, "<bpmn>", "</bpmn>");

            return model;

        };
    }


    /**
     * Post a BPMN model to DFM, specified by the URL parameter 'id'.
     *
     * @return A Route
     */
    public static Route setRemoteBpmn(final String dfmEndpoint) {
        return (req, res) -> {

            String url = dfmEndpoint + "/setBPMN";
            return sendXMLPost(url, req.body());
        };
    }

    /**
     * Get the current status of all the machines.
     *
     * @return A Route object, which returns a JSON string to represent the machine status.
     */
    public static Route getState() {
        return (req, res) -> {
            res.type("application/json");
            return gson.toJson(be.getStatus());
        };

    }

    // Send get request
    private static String sendGet(String urlString) throws Exception {
        HttpURLConnection connection = null;

        try {
            //Create connection
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            //Get Response
            InputStream is = connection.getInputStream();
            BufferedReader rd = new BufferedReader(new InputStreamReader(is));
            StringBuffer response = new StringBuffer();
            String line;
            while ((line = rd.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            rd.close();
            return response.toString();
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    // Send post request
    private static String sendPost(String urlString, Map<String, String> headerParams, String body) throws Exception {
        HttpURLConnection connection = null;

        try {
            //Create connection
            URL url = new URL(urlString);
            connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setRequestMethod("POST");

            connection.setRequestProperty("Content-Length",
                    Integer.toString(body.getBytes().length));

            // Set HTTP header parameters
            for(String key : headerParams.keySet()) {
                connection.setRequestProperty(key, headerParams.get(key));
            }

            //Send request
            DataOutputStream wr = new DataOutputStream(
                    connection.getOutputStream());
            wr.writeBytes(body);
            wr.close();

            //Get Response
            InputStream is = connection.getInputStream();
            BufferedReader rd = new BufferedReader(new InputStreamReader(is));
            StringBuilder response = new StringBuilder(); // or StringBuffer if Java version 5+
            String line;
            while ((line = rd.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            rd.close();
            return response.toString();
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String sendXMLPost(String urlString, String body) throws Exception {
        HashMap<String, String> headerParams = new HashMap<>();
        headerParams.put("Content-Type", "application/xml");
        return sendPost(urlString, headerParams, body);
    }

    // Convert a string to XML DOM
    private static Document convertStringToXml(String xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        // factory.setNamespaceAware(true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        InputSource is = new InputSource(new StringReader(xml));
        return builder.parse(is);
    }

    // Convert an XML DOM to string
    private static String convertXmlToString(Document doc) throws Exception {
        DOMSource domSource = new DOMSource(doc);
        StringWriter writer = new StringWriter();
        StreamResult result = new StreamResult(writer);
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.transform(domSource, result);
        return writer.toString();
    }
}
